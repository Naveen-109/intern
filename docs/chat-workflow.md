# Chat with Data Workflow

## Overview

The "Chat with Data" feature enables users to query the database using natural language. It uses Vanna AI with Groq LLM to generate SQL queries and execute them against PostgreSQL.

## Architecture Flow

```
User Input (Frontend)
    ↓
POST /api/chat-with-data (Backend API)
    ↓
POST /api/chat (Vanna AI Service)
    ↓
Groq LLM (SQL Generation)
    ↓
PostgreSQL (Query Execution)
    ↓
Results (JSON Response)
    ↓
Frontend (Display + Visualization)
```

## Step-by-Step Process

### 1. User Query Input

User types a natural language question in the chat interface:
```
"What's the total spend in the last 90 days?"
```

### 2. Frontend Request

Frontend sends POST request to backend API:
```typescript
POST /api/chat-with-data
{
  "query": "What's the total spend in the last 90 days?"
}
```

### 3. Backend Proxy

Backend API forwards the request to Vanna AI service:
```typescript
POST http://vanna-service:8000/api/chat
{
  "query": "What's the total spend in the last 90 days?"
}
```

### 4. SQL Generation

Vanna AI service:
- Retrieves database schema information
- Constructs prompt with schema context
- Sends prompt to Groq LLM
- Receives generated SQL query

**Example Generated SQL:**
```sql
SELECT SUM(amount) as total_spend
FROM payments
WHERE payment_date >= NOW() - INTERVAL '90 days';
```

### 5. Query Execution

Vanna AI service:
- Validates SQL syntax
- Executes query against PostgreSQL
- Retrieves results as list of dictionaries

**Example Results:**
```python
[
  {"total_spend": 125000.50}
]
```

### 6. Response Formatting

Vanna AI service returns structured response:
```json
{
  "sql": "SELECT SUM(amount) as total_spend FROM payments WHERE payment_date >= NOW() - INTERVAL '90 days';",
  "data": [
    {"total_spend": 125000.50}
  ],
  "message": "Query executed successfully"
}
```

### 7. Frontend Display

Frontend receives response and:
- Displays the generated SQL in a code block
- Renders results in a table or chart
- Shows appropriate visualization based on data structure

## Example Queries

### 1. Aggregation Query
**Input:** "What's the total spend in the last 90 days?"

**Generated SQL:**
```sql
SELECT SUM(amount) as total_spend
FROM payments
WHERE payment_date >= NOW() - INTERVAL '90 days';
```

**Visualization:** Single value card

### 2. Top N Query
**Input:** "List top 5 vendors by spend."

**Generated SQL:**
```sql
SELECT v.name, SUM(p.amount) as total_spend
FROM vendors v
JOIN payments p ON v.id = p.vendor_id
GROUP BY v.id, v.name
ORDER BY total_spend DESC
LIMIT 5;
```

**Visualization:** Horizontal bar chart

### 3. Filter Query
**Input:** "Show overdue invoices as of today."

**Generated SQL:**
```sql
SELECT i.*, v.name as vendor_name
FROM invoices i
JOIN vendors v ON i.vendor_id = v.id
WHERE i.status = 'OVERDUE'
   OR (i.status = 'PENDING' AND i.due_date < NOW());
```

**Visualization:** Data table

### 4. Time Series Query
**Input:** "Show monthly spend trends for the past year."

**Generated SQL:**
```sql
SELECT 
  DATE_TRUNC('month', payment_date) as month,
  SUM(amount) as total_spend
FROM payments
WHERE payment_date >= NOW() - INTERVAL '1 year'
GROUP BY DATE_TRUNC('month', payment_date)
ORDER BY month;
```

**Visualization:** Line chart

## Error Handling

### SQL Generation Errors
- If Groq API fails, return error message
- If generated SQL is invalid, attempt to fix or return error

### SQL Execution Errors
- If query fails, return error with SQL for debugging
- Log errors for monitoring

### Frontend Errors
- Display user-friendly error messages
- Show SQL query for debugging if available

## Security Considerations

1. **SQL Injection Prevention:**
   - Groq LLM generates parameterized queries when possible
   - Database connection uses parameterized queries
   - Input validation on user queries

2. **Read-Only Access:**
   - Vanna AI service should use read-only database user
   - Only SELECT queries should be allowed

3. **Rate Limiting:**
   - Implement rate limiting on chat endpoint
   - Prevent abuse of LLM API

4. **Query Validation:**
   - Validate SQL before execution
   - Block dangerous operations (DROP, DELETE, etc.)

## Performance Optimization

1. **Caching:**
   - Cache common queries and results
   - Cache schema information

2. **Query Optimization:**
   - Groq can be prompted to generate optimized SQL
   - Use database indexes effectively

3. **Response Streaming:**
   - Future: Stream SQL generation and results
   - Show progress to user

## Future Enhancements

1. **Query History:**
   - Save user queries and results
   - Allow users to revisit previous queries

2. **Query Suggestions:**
   - Suggest common queries
   - Auto-complete based on schema

3. **Multi-turn Conversations:**
   - Maintain context across queries
   - Support follow-up questions

4. **Advanced Visualizations:**
   - Auto-detect best chart type
   - Support complex multi-series charts

