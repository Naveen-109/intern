# Database Schema

## Overview

The database uses PostgreSQL with a normalized relational schema for invoice and vendor management.

## Entity Relationship Diagram

```
Vendor (1) ────< (N) Invoice (N) ────> (1) Customer
  │                                      │
  │                                      │
  │ (1)                                  │
  │                                      │
  └───< (N) Payment                     │
                                          │
Invoice (1) ────< (N) LineItem
```

## Tables

### Vendor

Stores vendor information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| name | String | Vendor name (unique) |
| email | String? | Vendor email |
| phone | String? | Vendor phone |
| address | String? | Vendor address |
| category | String? | Vendor category |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes:**
- `name`
- `category`

### Customer

Stores customer information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| name | String | Customer name (unique) |
| email | String? | Customer email |
| phone | String? | Customer phone |
| address | String? | Customer address |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes:**
- `name`

### Invoice

Stores invoice records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| invoiceNumber | String | Invoice number (unique) |
| vendorId | UUID (FK) | Reference to Vendor |
| customerId | UUID? (FK) | Reference to Customer |
| issueDate | DateTime | Invoice issue date |
| dueDate | DateTime? | Invoice due date |
| status | Enum | PENDING, PAID, OVERDUE, CANCELLED |
| subtotal | Decimal(12,2) | Subtotal amount |
| tax | Decimal(12,2) | Tax amount |
| total | Decimal(12,2) | Total amount |
| currency | String | Currency code (default: USD) |
| notes | String? | Additional notes |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes:**
- `vendorId`
- `customerId`
- `issueDate`
- `status`
- `invoiceNumber`

**Relationships:**
- Many-to-One with Vendor
- Many-to-One with Customer (optional)
- One-to-Many with LineItem
- One-to-Many with Payment

### LineItem

Stores individual line items within invoices.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| invoiceId | UUID (FK) | Reference to Invoice |
| description | String | Line item description |
| quantity | Decimal(10,2) | Quantity |
| unitPrice | Decimal(12,2) | Unit price |
| category | String? | Line item category |
| total | Decimal(12,2) | Line item total |
| createdAt | DateTime | Creation timestamp |

**Indexes:**
- `invoiceId`
- `category`

**Relationships:**
- Many-to-One with Invoice

### Payment

Stores payment records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| invoiceId | UUID (FK) | Reference to Invoice |
| vendorId | UUID (FK) | Reference to Vendor |
| amount | Decimal(12,2) | Payment amount |
| paymentDate | DateTime | Payment date |
| method | Enum | BANK_TRANSFER, CHECK, CREDIT_CARD, CASH, OTHER |
| reference | String? | Payment reference |
| createdAt | DateTime | Creation timestamp |

**Indexes:**
- `invoiceId`
- `vendorId`
- `paymentDate`

**Relationships:**
- Many-to-One with Invoice
- Many-to-One with Vendor

## Enums

### InvoiceStatus

- `PENDING`
- `PAID`
- `OVERDUE`
- `CANCELLED`

### PaymentMethod

- `BANK_TRANSFER`
- `CHECK`
- `CREDIT_CARD`
- `CASH`
- `OTHER`

## Data Normalization

The schema follows third normal form (3NF):

1. **Vendor and Customer** are separate entities to avoid duplication
2. **LineItems** are normalized to allow multiple items per invoice
3. **Payments** are tracked separately to support partial payments
4. **Categories** can be associated with both vendors and line items

## Sample Queries

### Get total spend by vendor
```sql
SELECT v.name, SUM(p.amount) as total_spend
FROM vendors v
JOIN payments p ON v.id = p.vendor_id
GROUP BY v.id, v.name
ORDER BY total_spend DESC;
```

### Get overdue invoices
```sql
SELECT i.*, v.name as vendor_name
FROM invoices i
JOIN vendors v ON i.vendor_id = v.id
WHERE i.status = 'OVERDUE'
  OR (i.status = 'PENDING' AND i.due_date < NOW());
```

### Get monthly invoice trends
```sql
SELECT 
  DATE_TRUNC('month', issue_date) as month,
  COUNT(*) as invoice_count,
  SUM(total) as total_spend
FROM invoices
GROUP BY DATE_TRUNC('month', issue_date)
ORDER BY month;
```

