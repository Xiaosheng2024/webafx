# Enterprise Website & E-Commerce Admin Panel - Database Migration Guide

This document provides instructions for setting up and migrating the database for the enterprise website and e-commerce platform's admin panel. It includes step-by-step procedures for initializing the database, running migrations, and seeding initial data.

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- NPM or Yarn package manager

## Setup Instructions

### 1. Database Configuration

1. Create a new MySQL database for the admin panel:

```sql
CREATE DATABASE enterprise_ecommerce_admin;
CREATE USER 'admin_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON enterprise_ecommerce_admin.* TO 'admin_user'@'localhost';
FLUSH PRIVILEGES;
```

2. Configure environment variables:

Create a `.env` file in your project root with the following content (update values as needed):

```
DATABASE_URL="mysql://admin_user:your_strong_password@localhost:3306/enterprise_ecommerce_admin"
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="1d"
```

### 2. Prisma Setup

1. Install Prisma CLI:

```bash
npm install -g prisma
```

2. Initialize Prisma in your project:

```bash
npm install @prisma/client
npx prisma init
```

3. Copy the schema from `admin_database_schema.prisma` to your `prisma/schema.prisma` file.

### 3. Running Migrations

Run the following commands to create and apply migrations based on your schema:

```bash
npx prisma migrate dev --name init
```

This command will:
- Generate SQL migration files in the `prisma/migrations` directory
- Apply the migrations to your database
- Generate the Prisma client based on your schema

For production environments, use:

```bash
npx prisma migrate deploy
```

### 4. Seeding the Database

1. Install the bcrypt package for password hashing:

```bash
npm install bcryptjs
```

2. Set up the seed script:

Copy the seed script from `admin_database_migrations.js` to `prisma/seed.js`.

3. Configure the package.json to use the seed script:

Add the following to your package.json:

```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

4. Run the seed script:

```bash
npx prisma db seed
```

Alternatively, if you want to seed the database with predefined JSON data:

```bash
node scripts/seed-from-json.js
```

Note: Ensure that the `admin_db_seed_data.json` file is available in your project.

### 5. Verifying the Migration

To verify that your database has been properly set up:

1. Use Prisma Studio to visually inspect the database:

```bash
npx prisma studio
```

This will open a browser interface at http://localhost:5555 where you can view and edit the database.

2. Run a simple query to check if the admin user was created:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });
  console.log('Admin user:', adminUser ? 'Found' : 'Not found');
  await prisma.$disconnect();
}

checkAdmin();
```

### 6. Migration Scripts for Future Updates

When making changes to the database schema:

1. Update the `prisma/schema.prisma` file with the new schema changes.

2. Create and apply a new migration:

```bash
npx prisma migrate dev --name describe_your_changes
```

3. Verify the changes using Prisma Studio.

## Database Backup and Restore

### Creating a Backup

```bash
mysqldump -u admin_user -p enterprise_ecommerce_admin > backup_filename.sql
```

### Restoring a Backup

```bash
mysql -u admin_user -p enterprise_ecommerce_admin < backup_filename.sql
```

## Troubleshooting Common Issues

### Migration Failed

If migrations fail, try:

1. Checking the error message for specific issues.
2. Reset the database (development only):

```bash
npx prisma migrate reset
```

3. If issues persist, try manually checking the database state:

```bash
mysql -u admin_user -p -e "USE enterprise_ecommerce_admin; SHOW TABLES;"
```

### Seed Data Issues

If seed data fails to load:

1. Check that the seed script can connect to the database.
2. Verify that there are no conflicts with existing data.
3. Try running with the `--reset` flag to clear the database first:

```bash
npx prisma migrate reset
```

## Advanced Configuration

### Connection Pooling

For production environments, consider adding connection pooling by modifying the DATABASE_URL:

```
DATABASE_URL="mysql://admin_user:your_strong_password@localhost:3306/enterprise_ecommerce_admin?connection_limit=5&pool_timeout=2"
```

### Logging

To enable query logging for debugging, add the following to your Prisma client initialization:

```javascript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Script for Loading JSON Seed Data

Create a file named `scripts/seed-from-json.js` with the following content:

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedFromJson() {
  try {
    console.log('Starting database seeding from JSON...');
    
    const jsonData = JSON.parse(fs.readFileSync(
      path.join(__dirname, '../admin_db_seed_data.json'), 
      'utf8'
    ));
    
    // Seed users
    for (const userData of jsonData.users) {
      // Hash password if it's not already hashed
      if (!userData.password.startsWith('$2a$')) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData,
      });
    }
    console.log(`Created ${jsonData.users.length} users`);
    
    // Seed other data following the same pattern...
    // Implementation for other entities would follow here
    
    console.log('Database seeding from JSON completed successfully!');
  } catch (error) {
    console.error('Error seeding database from JSON:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFromJson();
```
