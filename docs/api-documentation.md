# API Documentation

## Base URL

- Development: `http://localhost:3001/api`
- Production: `https://your-app.vercel.app/api`

## Endpoints

### GET /stats

Returns overview statistics for the dashboard cards.

**Response:**
```json
{
  "totalSpend": 125000.50,
  "totalInvoicesProcessed": 245,
  "documentsUploaded": 500,
  "averageInvoiceValue": 510.20
}
```

### GET /invoice-trends

Returns monthly invoice trends.

**Query Parameters:**
- `months` (optional): Number of months to include (default: 12)

**Response:**
```json
[
  {
    "month": "2024-01",
    "invoiceCount": 45,
    "totalSpend": 22500.00
  },
  {
    "month": "2024-02",
    "invoiceCount": 52,
    "totalSpend": 26000.00
  }
]
```

### GET /vendors/top10

Returns top 10 vendors by total spend.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Acme Corporation",
    "totalSpend": 50000.00
  }
]
```

### GET /category-spend

Returns spend grouped by category.

**Response:**
```json
[
  {
    "category": "Technology",
    "total": 75000.00
  },
  {
    "category": "Office Supplies",
    "total": 25000.00
  }
]
```

### GET /cash-outflow

Returns expected cash outflow forecast.

**Query Parameters:**
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

**Response:**
```json
[
  {
    "date": "2024-03-15",
    "amount": 15000.00
  }
]
```

### GET /invoices

Returns paginated list of invoices.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `search` (optional): Search by invoice number or vendor name
- `status` (optional): Filter by status (PENDING, PAID, OVERDUE, CANCELLED)
- `vendorId` (optional): Filter by vendor ID
- `sortBy` (optional): Sort field (default: issueDate)
- `sortOrder` (optional): Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-2024-001",
      "vendor": "Acme Corporation",
      "vendorId": "uuid",
      "customer": "Tech Solutions LLC",
      "issueDate": "2024-01-15T00:00:00.000Z",
      "dueDate": "2024-02-15T00:00:00.000Z",
      "amount": 5500.00,
      "status": "PAID",
      "currency": "USD"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 245,
    "totalPages": 5
  }
}
```

### POST /chat-with-data

Forwards natural language queries to Vanna AI service.

**Request Body:**
```json
{
  "query": "What's the total spend in the last 90 days?"
}
```

**Response:**
```json
{
  "sql": "SELECT SUM(amount) FROM payments WHERE payment_date >= NOW() - INTERVAL '90 days'",
  "data": [
    {
      "sum": 125000.50
    }
  ],
  "message": "Query executed successfully"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "message": "Detailed error message (development only)"
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad Request
- `500`: Internal Server Error

