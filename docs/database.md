# Database Documentation

## Overview

The application uses PostgreSQL as its primary database, with Prisma as the ORM layer. Prisma provides type-safe database access, automatic migrations, and a powerful query API.

## Prisma Setup

### Configuration

The database connection is configured in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://user:password@localhost:5432/dbname`)

## Database Operations

### Prisma Client

The Prisma Client is used to interact with the database. It's typically instantiated once and reused:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
```

### Common Operations

1. **Create Records**

```typescript
// Create a single record
const user = await prisma.user.create({
  data: {
    name: "John Doe",
    email: "john@example.com",
  },
});

// Create multiple records
const users = await prisma.user.createMany({
  data: [
    { name: "John", email: "john@example.com" },
    { name: "Jane", email: "jane@example.com" },
  ],
});
```

2. **Read Records**

```typescript
// Find unique record
const user = await prisma.user.findUnique({
  where: { email: "john@example.com" },
});

// Find many records with filtering
const users = await prisma.user.findMany({
  where: {
    role: "ADMIN",
    banned: false,
  },
});

// Include related records
const userWithProducts = await prisma.user.findUnique({
  where: { id: "user-id" },
  include: {
    products: true,
    sessions: true,
  },
});
```

3. **Update Records**

```typescript
// Update single record
const updatedUser = await prisma.user.update({
  where: { id: "user-id" },
  data: { name: "New Name" },
});

// Update many records
const updatedUsers = await prisma.user.updateMany({
  where: { role: "USER" },
  data: { role: "ADMIN" },
});
```

4. **Delete Records**

```typescript
// Delete single record
const deletedUser = await prisma.user.delete({
  where: { id: "user-id" },
});

// Delete many records
const deletedUsers = await prisma.user.deleteMany({
  where: { banned: true },
});
```

### Transactions

Prisma supports transactions for operations that need to be atomic:

```typescript
const result = await prisma.$transaction([
  prisma.user.create({ data: { ... } }),
  prisma.organization.create({ data: { ... } })
])
```

## Database Management

### Migrations

Prisma Migrate is used to manage database schema changes:

1. **Create a Migration**

```bash
npx prisma migrate dev --name <migration_name>
```

2. **Apply Migrations in Production**

```bash
npx prisma migrate deploy
```

3. **Reset Database**

```bash
npx prisma migrate reset
```

### Database Seeding

The database can be seeded with initial data:

1. **Configure Seeding**
   Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

2. **Run Seeding**

```bash
npx prisma db seed
```

## Best Practices

1. **Query Optimization**

   - Use `select` to fetch only needed fields
   - Implement proper indexes
   - Use pagination for large result sets
   - Avoid N+1 queries by using `include`

2. **Error Handling**

   - Handle Prisma errors appropriately
   - Use transactions for related operations
   - Implement proper validation before database operations

3. **Security**

   - Never expose Prisma Client directly to the client
   - Use environment variables for sensitive data
   - Implement proper access control in your application layer

4. **Performance**
   - Use connection pooling in production
   - Monitor query performance
   - Implement caching where appropriate
   - Use batch operations when possible
