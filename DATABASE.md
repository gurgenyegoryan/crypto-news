# Database Management Guide

## Current Status

✅ **All data is now saved to PostgreSQL database**

The following tables are created and active:
- `users` - User accounts with authentication
- `wallets` - Wallet addresses linked to users
- `alerts` - Price alerts for users
- `portfolio_snapshots` - Historical portfolio data

## Viewing Database Data

### Connect to PostgreSQL

```bash
# Connect to the database container
docker exec -it cryptomonitor-postgres psql -U postgres -d cryptomonitor

# List all tables
\dt

# View table structure
\d users
\d wallets
\d alerts

# Query data
SELECT * FROM users;
SELECT * FROM wallets;
SELECT * FROM alerts;

# Exit
\q
```

## Managing Migrations

### View Existing Migrations

```bash
cd apps/api
ls prisma/migrations/
```

### Create a New Migration

When you modify `schema.prisma`:

```bash
cd apps/api

# Generate migration
npx prisma migrate dev --name add_new_column

# This will:
# 1. Create SQL migration file
# 2. Apply it to the database
# 3. Regenerate Prisma Client
```

### Apply Migrations in Production

```bash
npx prisma migrate deploy
```

### Reset Database (⚠️ Deletes all data)

```bash
npx prisma migrate reset
```

## Seeding the Database

### Run the Seed Script

```bash
cd apps/api

# Run seed
npx prisma db seed

# Or manually
npx ts-node prisma/seed.ts
```

This will create:
- 2 test users (demo@cryptomonitor.app, test@example.com)
- Sample wallets
- Sample alerts
- Portfolio snapshots

**Login credentials for demo user:**
- Email: `demo@cryptomonitor.app`
- Password: `password123`

### Customize Seed Data

Edit `apps/api/prisma/seed.ts` to add your own test data.

## Common Database Tasks

### Check Migration Status

```bash
npx prisma migrate status
```

### Generate Prisma Client (after schema changes)

```bash
npx prisma generate
```

### Open Prisma Studio (Database GUI)

```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Backup Database

```bash
docker exec cryptomonitor-postgres pg_dump -U postgres cryptomonitor > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker exec -i cryptomonitor-postgres psql -U postgres -d cryptomonitor
```

## Example: Adding a New Field

1. **Edit schema.prisma:**

```prisma
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  password    String?
  name        String?
  telegramId  String?  @unique @map("telegram_id")
  createdAt   DateTime @default(now()) @map("created_at")
  tier        String   @default("free")
  
  // NEW FIELD
  avatar      String?  // Add avatar URL
  
  wallets     Wallet[]
  alerts      Alert[]
  snapshots   PortfolioSnapshot[]

  @@map("users")
}
```

2. **Create migration:**

```bash
npx prisma migrate dev --name add_user_avatar
```

3. **Rebuild Docker containers:**

```bash
docker compose up -d --build
```

## Troubleshooting

### "Migration failed" error

```bash
# Reset and reapply all migrations
npx prisma migrate reset
npx prisma migrate deploy
```

### "Prisma Client not generated"

```bash
npx prisma generate
```

### View database logs

```bash
docker logs cryptomonitor-postgres
```
