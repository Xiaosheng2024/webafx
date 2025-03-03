# Admin Panel Routes Implementation & Backend Development Guide

## Admin Panel Routes Implementation

Based on the existing dashboard and login pages that have already been created, here's how to implement the admin panel routes within the Next.js framework:

### 1. Router Configuration for Admin Panel

Create a dedicated router configuration for the admin panel using Next.js file-based routing system:

```javascript
// pages/admin/index.js - Already created dashboard page
// pages/admin/login.js - Already created login page

// Additional admin routes to implement:
// pages/admin/products/index.js - Product listing
// pages/admin/products/create.js - Create new product
// pages/admin/products/[id]/edit.js - Edit product
// pages/admin/products/categories.js - Manage categories

// pages/admin/content/articles/index.js - Article listing
// pages/admin/content/articles/create.js - Create new article
// pages/admin/content/articles/[id]/edit.js - Edit article

// pages/admin/content/cases/index.js - Case studies listing
// pages/admin/content/cases/create.js - Create new case study
// pages/admin/content/cases/[id]/edit.js - Edit case study

// pages/admin/media/index.js - Media library
// pages/admin/inquiries/index.js - Inquiries management
// pages/admin/settings/index.js - System settings
```

### 2. Route Protection Middleware

Implement route protection for admin routes to ensure only authenticated admin users can access them:

```javascript
// middleware.js
import { NextResponse } from 'next/server'
import { verifyAuth } from './lib/auth'

export async function middleware(request) {
  // Check if the request is for an admin route
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    
    // Get the token from the cookies
    const token = request.cookies.get('admin_token')?.value
    
    // If no token or invalid token, redirect to login
    if (!token || !(await verifyAuth(token))) {
      const url = new URL('/admin/login', request.url)
      url.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
```

## Backend API Implementation

Based on the existing system design, implement the following API endpoints to support the admin panel functions:

### 1. Authentication API

```javascript
// pages/api/admin/auth/login.js
import { sign } from 'jsonwebtoken'
import { compare } from 'bcrypt'
import { db } from '../../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  
  const { username, password } = req.body
  
  try {
    // Find user in database
    const user = await db.user.findFirst({
      where: { username },
      include: { role: true }
    })
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    // Verify password
    const passwordMatch = await compare(password, user.password_hash)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    // Check if user has admin role
    if (user.role.name !== 'admin' && user.role.name !== 'super_admin') {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }
    
    // Generate JWT token
    const token = sign(
      { id: user.id, role: user.role.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )
    
    // Update last login time
    await db.user.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    })
    
    // Set cookie with token
    res.setHeader('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; Max-Age=${8 * 60 * 60}`)
    
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
```

### 2. Products API

```javascript
// pages/api/admin/products/index.js
import { db } from '../../../../lib/db'
import { authMiddleware } from '../../../../lib/auth-middleware'

async function handler(req, res) {
  // GET - Retrieve products list with pagination
  if (req.method === 'GET') {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const search = req.query.search || ''
    
    try {
      const products = await db.product.findMany({
        where: {
          OR: [
            { name: { contains: search } },
            { model_number: { contains: search } },
            { sku: { contains: search } }
          ]
        },
        include: {
          productType: true,
          productImages: {
            where: { is_primary: true },
            include: { media: true },
            take: 1
          }
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      })
      
      const totalCount = await db.product.count({
        where: {
          OR: [
            { name: { contains: search } },
            { model_number: { contains: search } },
            { sku: { contains: search } }
          ]
        }
      })
      
      return res.status(200).json({
        products,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      })
    } catch (error) {
      console.error('Error fetching products:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
  
  // POST - Create new product
  if (req.method === 'POST') {
    const { name, slug, model_number, sku, description, short_description, 
           featured, status, product_type_id, categories, attributes } = req.body
    
    try {
      // Start a transaction
      const result = await db.$transaction(async (tx) => {
        // Create the product
        const product = await tx.product.create({
          data: {
            name,
            slug,
            model_number,
            sku,
            description,
            short_description,
            featured,
            status,
            product_type_id,
            created_by: req.user.id,
            updated_by: req.user.id
          }
        })
        
        // Add categories
        if (categories && categories.length > 0) {
          await Promise.all(categories.map(categoryId => {
            return tx.productCategoryRelation.create({
              data: {
                product_id: product.id,
                category_id: categoryId
              }
            })
          }))
        }
        
        // Add attributes
        if (attributes && attributes.length > 0) {
          await Promise.all(attributes.map(attr => {
            return tx.productAttribute.create({
              data: {
                product_id: product.id,
                attribute_definition_id: attr.definition_id,
                value: attr.value
              }
            })
          }))
        }
        
        return product
      })
      
      return res.status(201).json(result)
    } catch (error) {
      console.error('Error creating product:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' })
}

export default authMiddleware(handler)
```

## Database Development

Implement the database schema based on the existing class diagram. Here's an example of how to set up the core database models using Prisma ORM:

### Prisma Schema (schema.prisma)

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int              @id @default(autoincrement())
  username      String           @unique
  email         String           @unique
  password_hash String
  role_id       Int
  last_login    DateTime?
  created_at    DateTime         @default(now())
  updated_at    DateTime         @updatedAt
  is_active     Boolean          @default(true)
  role          Role             @relation(fields: [role_id], references: [id])
  articles      Article[]        @relation("AuthorRelation")
  created_articles Article[]     @relation("CreatedByRelation")
  updated_articles Article[]     @relation("UpdatedByRelation")
  created_products Product[]     @relation("ProductCreatedByRelation")
  updated_products Product[]     @relation("ProductUpdatedByRelation")
  inquiry_responses InquiryResponse[]
  admin_activities AdminActivity[]
}

model Role {
  id            Int              @id @default(autoincrement())
  name          String           @unique
  description   String?
  created_at    DateTime         @default(now())
  updated_at    DateTime         @updatedAt
  users         User[]
  role_permissions RolePermission[]
}

model Permission {
  id            Int              @id @default(autoincrement())
  name          String           @unique
  code          String           @unique
  description   String?
  created_at    DateTime         @default(now())
  updated_at    DateTime         @updatedAt
  role_permissions RolePermission[]
}

model RolePermission {
  role_id       Int
  permission_id Int
  role          Role             @relation(fields: [role_id], references: [id])
  permission    Permission       @relation(fields: [permission_id], references: [id])

  @@id([role_id, permission_id])
}

model Product {
  id               Int              @id @default(autoincrement())
  name             String
  slug             String           @unique
  model_number     String?
  sku              String?
  description      String?          @db.Text
  short_description String?          @db.Text
  featured         Boolean          @default(false)
  status           String           @default("draft") // draft, published, archived
  product_type_id  Int
  created_at       DateTime         @default(now())
  updated_at       DateTime         @updatedAt
  created_by       Int
  updated_by       Int
  product_type     ProductType      @relation(fields: [product_type_id], references: [id])
  creator          User             @relation("ProductCreatedByRelation", fields: [created_by], references: [id])
  updater          User             @relation("ProductUpdatedByRelation", fields: [updated_by], references: [id])
  product_attributes ProductAttribute[]
  product_images    ProductImage[]
  category_relations ProductCategoryRelation[]
  product_tags      ProductTag[]
  product_relations_from ProductRelation[]  @relation("ProductFromRelation")
  product_relations_to   ProductRelation[]  @relation("ProductToRelation")
  article_relations ProductArticleRelation[]
  case_relations    ProductCaseRelation[]
  inquiries         Inquiry[]
  seo_settings      SeoSettings[]  
}

// Additional models should be implemented according to the class diagram
// For brevity, I've included only the core models here
```

## Next Steps for Implementation

1. **Complete the API Implementation**:
   - Implement the remaining API endpoints for articles, case studies, media, etc.
   - Follow the RESTful pattern established above for consistency

2. **Frontend Components**:
   - Create reusable admin components (forms, tables, filters)
   - Implement data fetching with React Query for efficient caching

3. **Database Migrations**:
   - Generate Prisma migrations for the schema above
   - Implement seeder scripts for initial data (admin user, default roles)

4. **Testing**:
   - Implement API endpoint testing
   - Add frontend component tests

5. **Integration**:
   - Connect the existing admin dashboard to the API endpoints
   - Implement proper error handling and loading states

By following this implementation guide, you can systematically build out the admin panel router and backend functionality while ensuring consistency with the existing system design.