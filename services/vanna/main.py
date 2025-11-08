from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import vanna as vn
from groq import Groq
import psycopg2
from psycopg2.extras import RealDictCursor
import json

load_dotenv()

app = FastAPI(title="Vanna AI Service", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Groq API setup
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")

groq_client = Groq(api_key=GROQ_API_KEY)

# Vanna setup
vn.set_api_key(os.getenv("VANNA_API_KEY", ""))
vn.set_model("groq")
vn.set_db(DATABASE_URL)


class ChatRequest(BaseModel):
    query: str


class ChatResponse(BaseModel):
    sql: str
    data: list
    message: str = "Query executed successfully"


def get_db_connection():
    """Get PostgreSQL connection"""
    # Convert postgresql+psycopg:// to postgresql:// for psycopg2
    db_url = DATABASE_URL.replace("postgresql+psycopg://", "postgresql://")
    return psycopg2.connect(db_url)


def execute_sql(sql: str) -> list:
    """Execute SQL query and return results as list of dicts"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(sql)
            results = cursor.fetchall()
            # Convert RealDictRow to regular dict
            return [dict(row) for row in results]
    finally:
        conn.close()


def generate_sql_with_groq(question: str) -> str:
    """Generate SQL using Groq LLM"""
    
    # Get database schema information
    schema_info = get_schema_info()
    
    prompt = f"""You are a SQL expert. Given the following database schema and a question, generate a valid PostgreSQL SQL query.

Database Schema:
{schema_info}

Question: {question}

Generate a PostgreSQL SQL query that answers this question. Return ONLY the SQL query, no explanations or markdown formatting.
"""

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a SQL expert. Generate valid PostgreSQL queries based on user questions and database schema."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama3-8b-8192",  # or "mixtral-8x7b-32768" for better performance
            temperature=0.1,
            max_tokens=1000,
        )
        
        sql = chat_completion.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        if sql.startswith("```"):
            sql = sql.split("```")[1]
            if sql.startswith("sql"):
                sql = sql[3:]
            sql = sql.strip()
        
        return sql
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating SQL: {str(e)}")


def get_schema_info() -> str:
    """Get database schema information for context"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Get table names
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name;
            """)
            tables = [row[0] for row in cursor.fetchall()]
            
            schema_info = []
            for table in tables:
                # Get column information
                cursor.execute("""
                    SELECT 
                        column_name,
                        data_type,
                        is_nullable,
                        column_default
                    FROM information_schema.columns
                    WHERE table_schema = 'public' 
                    AND table_name = %s
                    ORDER BY ordinal_position;
                """, (table,))
                
                columns = cursor.fetchall()
                col_info = []
                for col in columns:
                    col_info.append(f"  - {col[0]} ({col[1]})")
                
                schema_info.append(f"{table}:\n" + "\n".join(col_info))
            
            return "\n\n".join(schema_info)
    finally:
        conn.close()


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "vanna-ai"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process natural language query and return SQL + results"""
    try:
        # Generate SQL using Groq
        sql = generate_sql_with_groq(request.query)
        
        # Execute SQL
        try:
            data = execute_sql(sql)
        except Exception as e:
            return ChatResponse(
                sql=sql,
                data=[],
                message=f"SQL generated but execution failed: {str(e)}"
            )
        
        return ChatResponse(
            sql=sql,
            data=data,
            message="Query executed successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

