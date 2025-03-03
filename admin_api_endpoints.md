# Enterprise Website & E-Commerce Admin Panel - API Endpoints

This document outlines the backend API endpoints for the enterprise website and e-commerce platform's admin panel. These endpoints are designed to support all the administrative functionalities required for managing products, content, users, inquiries, and system settings.

## API Design Principles

- **RESTful Design**: Following REST principles for predictable URL patterns and HTTP methods
- **Consistent Response Format**: All API responses follow a standard format
- **Authentication Required**: All admin endpoints require authentication with appropriate role permissions
- **Pagination**: List endpoints support pagination for large datasets
- **Filtering & Sorting**: Advanced filtering and sorting capabilities for data retrieval
- **Comprehensive Error Handling**: Detailed error messages and appropriate status codes

## Authentication & Authorization

### Base URL: `/api/admin/auth`

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/login` | POST | Admin user login | `{"email": "string", "password": "string"}` | `{"token": "string", "user": {...}}` |
| `/logout` | POST | Admin user logout | None | `{"success": true}` |
| `/me` | GET | Get current user info | None | `{"user": {...}}` |
| `/change-password` | PUT | Change user's password | `{"currentPassword": "string", "newPassword": "string"}` | `{"success": true}` |
| `/forgot-password` | POST | Initiate password reset | `{"email": "string"}` | `{"success": true}` |
| `/reset-password` | POST | Reset password with token | `{"token": "string", "newPassword": "string"}` | `{"success": true}` |

## User Management

### Base URL: `/api/admin/users`

| Endpoint | Method | Description | Request Body/Params | Response |
|----------|--------|-------------|---------------------|----------|
| `/` | GET | Get all users (paginated) | Query: `page`, `limit`, `role`, `search` | `{"users": [...], "total": number, "page": number, "limit": number}` |
| `/` | POST | Create new user | `{"email": "string", "name": "string", "password": "string", "role": "ADMIN|EDITOR|USER"}` | `{"user": {...}}` |
| `/:id` | GET | Get user by ID | Path: `id` | `{"user": {...}}` |
| `/:id` | PUT | Update user | Path: `id`, Body: user object | `{"user": {...}}` |
| `/:id` | DELETE | Delete user | Path: `id` | `{"success": true}` |
| `/:id/activate` | PUT | Activate user | Path: `id` | `{"success": true}` |
| `/:id/deactivate` | PUT | Deactivate user | Path: `id` | `{"success": true}` |

## Product Management

### Base URL: `/api/admin/product-categories`

| Endpoint | Method | Description | Request Body/Params | Response |
|----------|--------|-------------|---------------------|----------|
| `/` | GET | Get all categories (with hierarchy) | Query: `includeInactive` | `{"categories": [...]}` |
| `/` | POST | Create new category | Category object | `{"category": {...}}` |
| `/:id` | GET | Get category by ID | Path: `id` | `{"category": {...}}` |
| `/:id` | PUT | Update category | Path: `id`, Body: category object | `{"category": {...}}` |
| `/:id` | DELETE | Delete category | Path: `id` | `{"success": true}` |

### Base URL: `/api/admin/products`

| Endpoint | Method | Description | Request Body/Params | Response |
|----------|--------|-------------|---------------------|----------|
| `/` | GET | Get all products (paginated) | Query: `page`, `limit`, `category`, `search`, `isPublished` | `{"products": [...], "total": number, "page": number, "limit": number}` |
| `/` | POST | Create new product | Product object | `{"product": {...}}` |
| `/:id` | GET | Get product by ID | Path: `id` | `{"product": {...}}` |
| `/:id` | PUT | Update product | Path: `id`, Body: product object | `{"product": {...}}` |
| `/:id` | DELETE | Delete product | Path: `id` | `{"success": true}` |
| `/:id/publish` | PUT | Publish product | Path: `id` | `{"success": true}` |
| `/:id/unpublish` | PUT | Unpublish product | Path: `id` | `{"success": true}` |
| `/:id/images` | POST | Add image to product | Path: `id`, Body: `FormData` with image file | `{"image": {...}}` |
| `/:id/images/:imageId` | DELETE | Delete product image | Path: `id`, `imageId` | `{"success": true}` |
| `/:id/videos` | POST | Add video to product | Path: `id`, Body: video object | `{"video": {...}}` |
| `/:id/videos/:videoId` | DELETE | Delete product video | Path: `id`, `videoId` | `{"success": true}` |
| `/:id/documents` | POST | Add document to product | Path: `id`, Body: `FormData` with document file | `{"document": {...}}` |
| `/:id/documents/:docId` | DELETE | Delete product document | Path: `id`, `docId` | `{"success": true}` |
| `/:id/attributes` | POST | Add attribute to product | Path: `id`, Body: attribute object | `{"attribute": {...}}` |
| `/:id/attributes/:attrId` | PUT | Update product attribute | Path: `id`, `attrId`, Body: attribute object | `{"attribute": {...}}` |
| `/:id/attributes/:attrId` | DELETE | Delete product attribute | Path: `id`, `attrId` | `{"success": true}` |
| `/:id/specifications` | POST | Add specification to product | Path: `id`, Body: specification object | `{"specification": {...}}` |
| `/:id/specifications/:specId` | PUT | Update product specification | Path: `id`, `specId`, Body: specification object | `{"specification": {...}}` |
| `/:id/specifications/:specId` | DELETE | Delete product specification | Path: `id`, `specId` | `{"success": true}` |
| `/:id/related-products` | POST | Add related product | Path: `id`, Body: `{"relatedProductId": "string", "relationType": "string"}` | `{"relation": {...}}` |
| `/:id/related-products/:relationId` | DELETE | Remove related product | Path: `id`, `relationId` | `{"success": true}` |
| `/:id/tags` | POST | Add tag to product | Path: `id`, Body: `{"tagId": "string"}` | `{"success": true}` |
| `/:id/tags/:tagId` | DELETE | Remove tag from product | Path: `id`, `tagId` | `{"success": true}` |

## Content Management

### Base URL: `/api/admin/article-categories`

| Endpoint | Method | Description | Request Body/Params | Response |
|----------|--------|-------------|---------------------|----------|
| `/` | GET | Get all categories (with hierarchy) | Query: `includeInactive` | `{"categories": [...]}` |
| `/` | POST | Create new category | Category object | `{"category": {...}}` |
| `/:id` | GET | Get category by ID | Path: `id` | `{"category": {...}}` |
| `/:id` | PUT | Update category | Path: `id`, Body: category object | `{"category": {...}}` |
| `/:id` | DELETE | Delete category | Path: `id` | `{"success": true}` |

### Base URL: `/api/admin/articles`

| Endpoint | Method | Description | Request Body/Params | Response |
|----------|--------|-------------|---------------------|----------|
| `/` | GET | Get all articles (paginated) | Query: `page`, `limit`, `category`, `search`, `isPublished` | `{"articles": [...], "total": number, "page": number, "limit": number}` |
| `/` | POST | Create new article | Article object | `{"article": {...}}` |
| `/:id` | GET | Get article by ID | Path: `id` | `{"article": {...}}` |
| `/:id` | PUT | Update article | Path: `id`, Body: article object | `{"article": {...}}` |
| `/:id` | DELETE | Delete article | Path: `id` | `{"success": true}` |
| `/:id/publish` | PUT | Publish article | Path: `id` | `{"success": true}` |
| `/:id/unpublish` | PUT | Unpublish article | Path: `id` | `{"success": true}` |
| `/:id/upload-image` | POST | Upload article featured image | Path: `id`, Body: `FormData` with image file | `{"url": "string"}` |
| `/:id/related-products` | POST | Add related product | Path: `id`, Body: `{"productId": "string"}` | `{"relation": {...}}` |
| `/:id/related-products/:productId` | DELETE | Remove related product | Path: `id`, `productId` | `{"success": true}` |
| `/:id/tags` | POST | Add tag to article | Path: `id`, Body: `{"tagId": "string"}` | `{"success": true}` |
| `/:id/tags/:tagId` | DELETE | Remove tag from article | Path: `id`, `tagId` | `{"success": true}` |

### Base URL: `/api/admin/case-studies`

| Endpoint | Method | Description | Request Body/Params | Response |
|----------|--------|-------------|---------------------|----------|
| `/` | GET | Get all case studies (paginated) | Query: `page`, `limit`, `search`, `isPublished` | `{"cases": [...], "total": number, "page": number, "limit": number}` |
| `/` | POST | Create new case study | Case study object | `{"case": {...}}` |
| `/:id` | GET | Get case study by ID | Path: `id` | `{"case": {...}}` |
| `/:id` | PUT | Update case study | Path: `id`, Body: case study object | `{"case": {...}}` |
| `/:id` | DELETE | Delete case study | Path: `id` | `{"success": true}` |
| `/:id/publish` | PUT | Publish case study | Path: `id` | `{"success": true}` |
| `/:id/unpublish` | PUT | Unpublish case study | Path: `id` | `{"success": true}` |
| `/:id/upload-image` | POST | Upload case study featured image | Path: `id`, Body: `FormData` with image file | `{"url": "string"}` |
| `/:id/related-products` | POST | Add related product | Path: `id`, Body: `{"productId": "string"}` | `{"relation": {...}}` |
| `/:id/related-products/:productId` | DELETE | Remove related product | Path: `id`, `productId` | `{"success": true}` |
| `/:id/tags` | POST | Add tag to case study | Path: `id`, Body: `{"tagId": "string"}` | `{"success": true}` |
| `/:id/tags/:tagId` | DELETE | Remove tag from case study | Path: `id`, `tagId` | `{"success": true}` |

## Tag Management

### Base URL: `/api/admin/tags`

| Endpoint | Method | Description | Request Body/Params | Response |
|----------|--------|-------------|---------------------|----------|
| `/` | GET | Get all tags | Query: `search` | `{"tags": [...]}` |
| `/` | POST | Create new tag | `{"name": "string", "slug": "string"}` | `{"tag": {...}}` |
| `/:id` | GET | Get tag by ID | Path: `id` | `{"tag": {...}}` |
| `/:id` | PUT | Update tag | Path: `id`, Body: tag object | `{"tag": {...}}` |
| `/:id` | DELETE | Delete tag | Path: `id` | `{"success": true}` |

## Inquiry Management

### Base URL: `/api/admin/inquiries`

| Endpoint | Method | Description | Request Body/Params | Response |
|----------|--------|-------------|---------------------|----------|
| `/` | GET | Get all inquiries (paginated) | Query: `page`, `limit`, `status`, `priority`, `search` | `{"inquiries": [...], "total": number, "page": number, "limit": number}` |
| `/:id` | GET | Get inquiry by ID | Path: `id` | `{"inquiry": {...}}` |
| `/:id/status` | PUT | Update inquiry status | Path: `id`, Body: `{"status": "NEW|IN_PROGRESS|RESPONDED|CLOSED"}` | `{"inquiry": {...}}` |
| `/:id/priority` | PUT | Update inquiry priority | Path: `id`, Body: `{"priority": "LOW|MEDIUM|HIGH|URGENT"}` | `{"inquiry": {...}}` |
| `/:id/respond` | POST | Respond to inquiry | Path: `id`, Body: `{"responseMessage": "string"}` | `{"inquiry": {...}}` |

## Settings Management

### Base URL: `/api/admin/settings`

| Endpoint | Method | Description | Request Body/Params | Response |
|----------|--------|-------------|---------------------|----------|
| `/` | GET | Get all settings | Query: `group` | `{"settings": [...]}` |
| `/:key` | GET | Get setting by key | Path: `key` | `{"setting": {...}}` |
| `/:key` | PUT | Update setting | Path: `key`, Body: `{"value": "string"}` | `{"setting": {...}}` |
| `/bulk` | PUT | Update multiple settings | `{"settings": [{"key": "string", "value": "string"}]}` | `{"success": true}` |

## Statistics & Analytics

### Base URL: `/api/admin/statistics`

| Endpoint | Method | Description | Request Body/Params | Response |
|----------|--------|-------------|---------------------|----------|
| `/dashboard` | GET | Get dashboard statistics | Query: `period` ("day", "week", "month") | `{"inquiries": {...}, "products": {...}, "articles": {...}, "users": {...}}` |
| `/inquiries` | GET | Get inquiry statistics | Query: `startDate`, `endDate` | `{"total": number, "byStatus": [...], "byPriority": [...], "trend": [...]}` |
| `/content` | GET | Get content statistics | Query: `startDate`, `endDate` | `{"products": {...}, "articles": {...}, "cases": {...}}` |

## File Management

### Base URL: `/api/admin/files`

| Endpoint | Method | Description | Request Body/Params | Response |
|----------|--------|-------------|---------------------|----------|
| `/upload` | POST | Upload file | `FormData` with file | `{"url": "string", "filename": "string", "type": "string", "size": number}` |
| `/upload-multiple` | POST | Upload multiple files | `FormData` with files | `{"files": [...]}` |
| `/:id` | DELETE | Delete file | Path: `id` | `{"success": true}` |

## Activity Logging

### Base URL: `/api/admin/activity-logs`

| Endpoint | Method | Description | Request Body/Params | Response |
|----------|--------|-------------|---------------------|----------|
| `/` | GET | Get activity logs (paginated) | Query: `page`, `limit`, `userId`, `action`, `entityType`, `startDate`, `endDate` | `{"logs": [...], "total": number, "page": number, "limit": number}` |

## API Implementation Notes

### Authentication Middleware

All admin API endpoints should be protected by an authentication middleware that verifies the JWT token and checks user permissions based on roles.

```javascript
// Authentication middleware example (using Express.js)
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Unauthorized - Invalid user' });
    }
    
    // Check if user has admin role
    if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};
```

### Role-Based Permission Control

Implement more granular permission controls based on user roles:

```javascript
// Permission middleware for specific roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }
    next();
  };
};

// Example usage in routes
app.put('/api/admin/users/:id', authenticateAdmin, requireRole(['ADMIN']), updateUser);
```

### Standard API Response Format

All API responses should follow a consistent format:

```javascript
// Success response
{
  "success": true,
  "data": { ... },  // Response data
  "message": "Operation completed successfully"  // Optional message
}

// Error response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }  // Optional additional error details
  }
}
```

### Logging and Monitoring

Implement request logging for all admin API endpoints:

```javascript
// Activity logging middleware
const logActivity = async (req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    // Only log successful operations
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const parsedBody = JSON.parse(body);
        if (parsedBody.success) {
          prisma.adminActivity.create({
            data: {
              action: req.method,
              entityType: req.path.split('/')[3], // Extract entity type from URL
              entityId: req.params.id || 'multiple',
              userId: req.user.id,
              details: JSON.stringify({
                method: req.method,
                path: req.path,
                query: req.query,
                body: req.body
              }),
              ipAddress: req.ip,
              userAgent: req.headers['user-agent']
            }
          }).catch(err => console.error('Error logging activity:', err));
        }
      } catch (e) {
        // Ignore logging errors
      }
    }
    originalSend.call(this, body);
    return this;
  };
  next();
};
```

## Implementation Recommendations

1. **Use Prisma ORM**: Implement these API endpoints using Prisma ORM to interact with the database defined in the previous database schema

2. **Validation**: Use a validation library like Joi or Zod to validate all incoming request data

3. **Error Handling**: Implement a centralized error handling middleware to catch and format all errors

4. **Rate Limiting**: Add rate limiting to prevent abuse of the API

5. **Testing**: Create comprehensive tests for all API endpoints using Jest or another testing framework

6. **Documentation**: Consider using Swagger/OpenAPI to document these endpoints for frontend developers

7. **Monitoring**: Implement monitoring to track API performance and errors