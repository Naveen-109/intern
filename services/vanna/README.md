# Vanna AI Service

Self-hosted Vanna AI service for natural language SQL generation using Groq LLM.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables (copy `.env.example` to `.env`):
```env
DATABASE_URL=postgresql+psycopg://user:pass@host:5432/dbname
GROQ_API_KEY=your-groq-api-key
PORT=8000
```

3. Run the service:
```bash
python -m uvicorn main:app --reload --port 8000
```

## API Endpoints

### POST /api/chat

Process natural language queries and return SQL + results.

**Request:**
```json
{
  "query": "What's the total spend in the last 90 days?"
}
```

**Response:**
```json
{
  "sql": "SELECT SUM(amount) FROM payments WHERE payment_date >= NOW() - INTERVAL '90 days'",
  "data": [{"sum": 125000.50}],
  "message": "Query executed successfully"
}
```

## Deployment

Deploy to Render, Railway, Fly.io, or Digital Ocean:

1. Set environment variables in your platform
2. Install Python dependencies
3. Run: `uvicorn main:app --host 0.0.0.0 --port $PORT`

