# Enterprise Website & E-Commerce Platform Admin Implementation Guide

## Implementation approach

Based on the existing system design and PRD documents, this guide focuses on implementing the admin panel routes, backend development, and database setup. The admin panel has already been partially created with login and dashboard pages, so we'll build on this foundation.

### Admin Panel Architecture

The admin panel will be implemented within the Next.js application as a separate section with dedicated routing and components. This approach maintains consistency with the existing architecture while ensuring proper separation of concerns.

## Admin Panel Router Implementation

### 1. File Structure

Utilize Next.js's file-based routing system to implement the admin routes:

```
pages/
  admin/
    index.js              # Dashboard (already created)
    login.js              # Login page (already created)
    products/
      index.js            # Product listing
      create.js           # Create product form
      [id]/
        edit.js           # Edit product form
      categories/
        index.js          # Category management
    content/
      articles/
        index.js          # Article listing
        create.js         # Create article
        [id]/
          edit.js         # Edit article
      cases/
        index.js          # Case studies listing
        create.js         # Create case study
        [id]/
          edit.js         # Edit case study
    media/
      index.js            # Media library
    inquiries/
      index.js            # Inquiries listing
      [id]/
        view.js           # View & respond to inquiry
    settings/
      index.js            # General settings
      users/
        index.js          # Admin user management
      seo/
        index.js          # SEO settings
```

### 2. Route Protection

Implement route protection using Next.js middleware to ensure only authenticated admin users can access the admin routes:

```javascript
// middleware.js
import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request) {
  // Only apply to admin routes except login
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    
    const token = request.cookies.get('admin_token')?.value;
    
    // If token is invalid or missing, redirect to login
    if (!token || !verifyToken(token)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

## Backend API Development

Implement the following API endpoints to support admin functionality:

### 1. Authentication API

```javascript
// pages/api/admin/auth/login.js
import { db } from '../../../../lib/db';
import { comparePasswords, generateToken } from '../../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { username, password } = req.body;
    
    // Find user in database
    const user = await db.user.findUnique({
      where: { username },
      include: { role: true },
    });
    
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isValid = await comparePasswords(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user has admin role
    if (user.role.name !== 'admin' && user.role.name !== 'super_admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role.name,
    });
    
    // Update last login time
    await db.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });
    
    // Set HTTP-only cookie with token
    res.setHeader('Set-Cookie', [
      `admin_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${8 * 60 * 60}`,
    ]);
    
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
```

### 2. Product Management API

Implement CRUD operations for product management:

```javascript
// pages/api/admin/products/index.js
import { authMiddleware } from '../../../../lib/auth-middleware';
import { db } from '../../../../lib/db';

async function handler(req, res) {
  // GET: List products with pagination and filters
  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const status = req.query.status || undefined;
      const category = parseInt(req.query.category) || undefined;
      
      const whereClause = {
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { model_number: { contains: search } },
            { sku: { contains: search } },
          ],
        } : {}),
        ...(status ? { status } : {}),
        ...(category ? {
          category_relations: {
            some: { category_id: category }
          }
        } : {}),
      };
      
      const products = await db.product.findMany({
        where: whereClause,
        include: {
          product_type: true,
          product_images: {
            where: { is_primary: true },
            include: { media: true },
            take: 1,
          },
          category_relations: {
            include: { category: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      });
      
      const total = await db.product.count({ where: whereClause });
      
      return res.status(200).json({
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ message: 'Failed to fetch products' });
    }
  }
  
  // POST: Create new product
  if (req.method === 'POST') {
    try {
      const {
        name,
        slug,
        model_number,
        sku,
        description,
        short_description,
        featured,
        status,
        product_type_id,
        categories,
        attributes,
        images,
        seo,
      } = req.body;
      
      // Create product with transaction to ensure data integrity
      const product = await db.$transaction(async (tx) => {
        // Create main product record
        const newProduct = await tx.product.create({
          data: {
            name,
            slug,
            model_number,
            sku,
            description,
            short_description,
            featured: featured || false,
            status: status || 'draft',
            product_type_id,
            created_by: req.user.id,
            updated_by: req.user.id,
          },
        });
        
        // Add categories
        if (categories && categories.length > 0) {
          await Promise.all(categories.map(categoryId => {
            return tx.productCategoryRelation.create({
              data: {
                product_id: newProduct.id,
                category_id: categoryId,
              },
            });
          }));
        }
        
        // Add attributes
        if (attributes && attributes.length > 0) {
          await Promise.all(attributes.map(attr => {
            return tx.productAttribute.create({
              data: {
                product_id: newProduct.id,
                attribute_definition_id: attr.definition_id,
                value: attr.value,
              },
            });
          }));
        }
        
        // Add images
        if (images && images.length > 0) {
          await Promise.all(images.map((image, index) => {
            return tx.productImage.create({
              data: {
                product_id: newProduct.id,
                media_id: image.media_id,
                alt_text: image.alt_text || name,
                is_primary: index === 0, // First image is primary
                display_order: index,
              },
            });
          }));
        }
        
        // Add SEO settings
        if (seo) {
          await tx.seoSettings.create({
            data: {
              entity_type: 'product',
              entity_id: newProduct.id,
              meta_title: seo.meta_title || name,
              meta_description: seo.meta_description || short_description,
              meta_keywords: seo.meta_keywords || '',
              canonical_url: seo.canonical_url || '',
              updated_by: req.user.id,
            },
          });
        }
        
        return newProduct;
      });
      
      return res.status(201).json({
        success: true,
        product,
        message: 'Product created successfully',
      });
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({ message: 'Failed to create product' });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
}

export default authMiddleware(handler);
```

### 3. Media Upload API

Implement media upload functionality for product images and content:

```javascript
// pages/api/admin/media/upload.js
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../../../../lib/auth-middleware';
import { db } from '../../../../lib/db';
import { optimizeImage } from '../../../../lib/image-processor';

// Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const form = new IncomingForm({
      multiples: true,
      keepExtensions: true,
    });
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });
    
    const uploadedFiles = [];
    
    // Process each uploaded file
    for (const fileKey in files) {
      const file = files[fileKey];
      const fileArray = Array.isArray(file) ? file : [file];
      
      for (const f of fileArray) {
        const fileBuffer = await fs.readFile(f.filepath);
        const fileExt = path.extname(f.originalFilename).toLowerCase();
        const fileName = `${uuidv4()}${fileExt}`;
        const fileType = f.mimetype;
        const fileSize = f.size;
        
        // Generate file path
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const relativePath = `/uploads/${fileName}`;
        const absolutePath = path.join(uploadDir, fileName);
        
        // Ensure upload directory exists
        await fs.mkdir(uploadDir, { recursive: true });
        
        // Optimize image if it's an image type
        if (fileType.startsWith('image/')) {
          const optimizedBuffer = await optimizeImage(fileBuffer, fileExt);
          await fs.writeFile(absolutePath, optimizedBuffer);
        } else {
          // For non-image files, just copy them
          await fs.writeFile(absolutePath, fileBuffer);
        }
        
        // Save to database
        const media = await db.media.create({
          data: {
            file_name: fileName,
            file_path: relativePath,
            file_type: fileType,
            file_size: fileSize,
            mime_type: fileType,
            alt_text: fields.alt_text || f.originalFilename.replace(/\.[^/.]+$/, ''),
            title: fields.title || f.originalFilename.replace(/\.[^/.]+$/, ''),
            description: fields.description || '',
            created_by: req.user.id,
          },
        });
        
        uploadedFiles.push(media);
      }
    }
    
    return res.status(200).json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return res.status(500).json({ message: 'Error uploading files' });
  }
}

export default authMiddleware(handler);
```

## Database Setup

Implement the database schema using Prisma ORM as specified in the existing design. Here are the core models needed for the admin functionality:

```prisma
// schema.prisma

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// User Management
model User {
  id            Int       @id @default(autoincrement())
  username      String    @unique
  email         String    @unique
  password_hash String
  role_id       Int
  last_login    DateTime?
  is_active     Boolean   @default(true)
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  
  role Role @relation(fields: [role_id], references: [id])
  
  // Reverse relations
  created_products       Product[]       @relation("ProductCreatedBy")
  updated_products       Product[]       @relation("ProductUpdatedBy")
  created_articles       Article[]       @relation("ArticleCreatedBy")
  updated_articles       Article[]       @relation("ArticleUpdatedBy")
  authored_articles      Article[]       @relation("ArticleAuthor")
  created_cases          Case[]          @relation("CaseCreatedBy")
  updated_cases          Case[]          @relation("CaseUpdatedBy")
  inquiry_responses      InquiryResponse[]
  created_media          Media[]         @relation("MediaCreatedBy")
  system_configs         SystemConfig[]  @relation("ConfigUpdatedBy")
  admin_activities       AdminActivity[]
}

model Role {
  id            Int       @id @default(autoincrement())
  name          String    @unique
  description   String?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  
  users User[]
  role_permissions RolePermission[]
}

model Permission {
  id            Int       @id @default(autoincrement())
  name          String    @unique
  code          String    @unique
  description   String?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  
  role_permissions RolePermission[]
}

model RolePermission {
  role_id       Int
  permission_id Int
  
  role       Role       @relation(fields: [role_id], references: [id])
  permission Permission @relation(fields: [permission_id], references: [id])
  
  @@id([role_id, permission_id])
}

// Product Management
model Product {
  id                Int       @id @default(autoincrement())
  name              String
  slug              String    @unique
  model_number      String?
  sku               String?
  description       String?   @db.Text
  short_description String?   @db.Text
  featured          Boolean   @default(false)
  status            String    @default("draft") // draft, published, archived
  product_type_id   Int
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  created_by        Int
  updated_by        Int
  
  product_type ProductType @relation(fields: [product_type_id], references: [id])
  creator      User        @relation("ProductCreatedBy", fields: [created_by], references: [id])
  updater      User        @relation("ProductUpdatedBy", fields: [updated_by], references: [id])
  
  // Reverse relations
  product_attributes   ProductAttribute[]
  product_images       ProductImage[]
  category_relations   ProductCategoryRelation[]
  product_tags         ProductTag[]
  article_relations    ProductArticleRelation[]
  case_relations       ProductCaseRelation[]
  inquiries            Inquiry[]
  seo_settings         SeoSettings[]        @relation("ProductSeo")
}

model ProductType {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  description String?   @db.Text
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt
  
  products Product[]
  type_attribute_definitions ProductTypeAttributeDefinition[]
}

model ProductCategory {
  id          Int       @id @default(autoincrement())
  name        String
  slug        String    @unique
  description String?   @db.Text
  parent_id   Int?
  order       Int       @default(0)
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt
  
  parent      ProductCategory?  @relation("CategoryHierarchy", fields: [parent_id], references: [id], onDelete: SetNull)
  children    ProductCategory[] @relation("CategoryHierarchy")
  
  product_relations ProductCategoryRelation[]
}

// Add other models as needed based on the class diagram
```

## Integration with Frontend Components

Connect the admin frontend to the API endpoints using React Query for data fetching and caching:

```javascript
// hooks/useProducts.js
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';

// Fetch products with filters and pagination
export function useProducts(params = {}) {
  return useQuery(
    ['products', params],
    async () => {
      const { data } = await axios.get('/api/admin/products', { params });
      return data;
    },
    {
      keepPreviousData: true,
    }
  );
}

// Create new product
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (productData) => {
      const { data } = await axios.post('/api/admin/products', productData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
      },
    }
  );
}

// Update existing product
export function useUpdateProduct(productId) {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (productData) => {
      const { data } = await axios.put(`/api/admin/products/${productId}`, productData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        queryClient.invalidateQueries(['product', productId]);
      },
    }
  );
}
```

## Admin Panel Implementation Steps

1. **Authentication and Authorization**:
   - Complete the authentication middleware for protecting admin routes
   - Implement the admin login API and frontend components

2. **Admin Layout and Navigation**:
   - Create a responsive admin layout with sidebar navigation
   - Implement role-based menu visibility

3. **Product Management**:
   - Build product listing page with filtering and pagination
   - Create product form with dynamic attribute fields based on product type
   - Implement product categories management

4. **Content Management**:
   - Build article and case study editors with rich text support
   - Implement content categorization and tagging

5. **Media Library**:
   - Create media upload and browsing interface
   - Implement media selection for products and content

6. **Inquiry Management**:
   - Build inquiry listing with status filtering
   - Implement inquiry response interface

## Database Migration and Seeding

Implement migration and seeding scripts for the database:

```javascript
// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    // Create roles
    const adminRole = await prisma.role.create({
      data: {
        name: 'admin',
        description: 'Administrator with full access',
      },
    });

    const editorRole = await prisma.role.create({
      data: {
        name: 'editor',
        description: 'Content editor with limited access',
      },
    });

    // Create permissions
    const permissions = await Promise.all([
      prisma.permission.create({
        data: {
          name: 'Manage Products',
          code: 'manage_products',
          description: 'Create, update, and delete products',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'Manage Content',
          code: 'manage_content',
          description: 'Create, update, and delete articles and cases',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'Manage Media',
          code: 'manage_media',
          description: 'Upload and manage media files',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'Manage Users',
          code: 'manage_users',
          description: 'Create, update, and delete users',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'Manage Settings',
          code: 'manage_settings',
          description: 'Update system settings',
        },
      }),
    ]);

    // Assign permissions to admin role
    await Promise.all(
      permissions.map((permission) =>
        prisma.rolePermission.create({
          data: {
            role_id: adminRole.id,
            permission_id: permission.id,
          },
        })
      )
    );

    // Assign content permissions to editor role
    await Promise.all(
      permissions
        .filter((p) => ['manage_content', 'manage_media'].includes(p.code))
        .map((permission) =>
          prisma.rolePermission.create({
            data: {
              role_id: editorRole.id,
              permission_id: permission.id,
            },
          })
        )
    );

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password_hash: hashedPassword,
        role_id: adminRole.id,
        is_active: true,
      },
    });

    // Create product types
    const productTypes = await Promise.all([
      prisma.productType.create({
        data: {
          name: 'Scanning Equipment',
          description: 'Various scanning devices and equipment',
        },
      }),
      prisma.productType.create({
        data: {
          name: 'Printing Equipment',
          description: 'Various printing devices and equipment',
        },
      }),
      prisma.productType.create({
        data: {
          name: 'Software',
          description: 'Software solutions and services',
        },
      }),
      prisma.productType.create({
        data: {
          name: 'Solution Package',
          description: 'Integrated solution packages',
        },
      }),
    ]);

    // Create attribute definitions
    // Add common and type-specific attributes as needed

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
```

## Conclusion

This implementation guide provides a comprehensive roadmap for implementing the admin panel routes, backend APIs, and database structure for the enterprise website and e-commerce system. By following this approach, you can build a robust admin interface that integrates seamlessly with the existing frontend components while providing all the necessary functionality for managing products, content, and customer inquiries.