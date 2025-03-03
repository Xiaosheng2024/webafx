## API接口设计

### 1. 认证接口

```
POST /api/auth/login              # 用户登录
POST /api/auth/logout             # 用户登出
POST /api/auth/refresh-token      # 刷新令牌
POST /api/auth/reset-password     # 重置密码
```

### 2. 用户和权限管理接口

```
GET    /api/users                 # 获取用户列表
GET    /api/users/{id}            # 获取用户详情
POST   /api/users                 # 创建用户
PUT    /api/users/{id}            # 更新用户
DELETE /api/users/{id}            # 删除用户
PATCH  /api/users/{id}/status     # 修改用户状态

GET    /api/roles                 # 获取角色列表
GET    /api/roles/{id}            # 获取角色详情
POST   /api/roles                 # 创建角色
PUT    /api/roles/{id}            # 更新角色
DELETE /api/roles/{id}            # 删除角色
```

### 3. 产品中心接口

```
GET    /api/product-categories            # 获取产品分类列表
GET    /api/product-categories/{id}       # 获取产品分类详情
POST   /api/product-categories            # 创建产品分类
PUT    /api/product-categories/{id}       # 更新产品分类
DELETE /api/product-categories/{id}       # 删除产品分类

GET    /api/products                      # 获取产品列表
GET    /api/products/{id}                 # 获取产品详情
POST   /api/products                      # 创建产品
PUT    /api/products/{id}                 # 更新产品
DELETE /api/products/{id}                 # 删除产品
PATCH  /api/products/{id}/publish         # 发布产品
PATCH  /api/products/{id}/unpublish       # 取消发布产品
```

### 4. 解决方案接口

```
GET    /api/solutions                     # 获取解决方案列表
GET    /api/solutions/{id}                # 获取解决方案详情
POST   /api/solutions                     # 创建解决方案
PUT    /api/solutions/{id}                # 更新解决方案
DELETE /api/solutions/{id}                # 删除解决方案
PATCH  /api/solutions/{id}/publish        # 发布解决方案
PATCH  /api/solutions/{id}/unpublish      # 取消发布解决方案
```

### 5. 咨询中心接口

```
GET    /api/article-categories            # 获取文章分类列表
GET    /api/article-categories/{id}       # 获取文章分类详情
POST   /api/article-categories            # 创建文章分类
PUT    /api/article-categories/{id}       # 更新文章分类
DELETE /api/article-categories/{id}       # 删除文章分类

GET    /api/articles                      # 获取文章列表
GET    /api/articles/{id}                 # 获取文章详情
POST   /api/articles                      # 创建文章
PUT    /api/articles/{id}                 # 更新文章
DELETE /api/articles/{id}                 # 删除文章
PATCH  /api/articles/{id}/publish         # 发布文章
PATCH  /api/articles/{id}/unpublish       # 取消发布文章
```

### 6. 案例展示接口

```
GET    /api/case-categories               # 获取案例分类列表
GET    /api/case-categories/{id}          # 获取案例分类详情
POST   /api/case-categories               # 创建案例分类
PUT    /api/case-categories/{id}          # 更新案例分类
DELETE /api/case-categories/{id}          # 删除案例分类

GET    /api/cases                         # 获取案例列表
GET    /api/cases/{id}                    # 获取案例详情
POST   /api/cases                         # 创建案例
PUT    /api/cases/{id}                    # 更新案例
DELETE /api/cases/{id}                    # 删除案例
PATCH  /api/cases/{id}/publish            # 发布案例
PATCH  /api/cases/{id}/unpublish          # 取消发布案例
```

### 7. 关于我们接口

```
GET    /api/about-contents                # 获取关于我们内容列表
GET    /api/about-contents/{id}           # 获取关于我们内容详情
POST   /api/about-contents                # 创建关于我们内容
PUT    /api/about-contents/{id}           # 更新关于我们内容
DELETE /api/about-contents/{id}           # 删除关于我们内容
PATCH  /api/about-contents/{id}/publish   # 发布关于我们内容
PATCH  /api/about-contents/{id}/unpublish # 取消发布关于我们内容
```

### 8. 联系我们接口

```
GET    /api/contact-infos                 # 获取联系方式列表
GET    /api/contact-infos/{id}            # 获取联系方式详情
POST   /api/contact-infos                 # 创建联系方式
PUT    /api/contact-infos/{id}            # 更新联系方式
DELETE /api/contact-infos/{id}            # 删除联系方式
PATCH  /api/contact-infos/{id}/publish    # 发布联系方式
PATCH  /api/contact-infos/{id}/unpublish  # 取消发布联系方式

GET    /api/contact-messages              # 获取联系留言列表
GET    /api/contact-messages/{id}         # 获取联系留言详情
POST   /api/contact-messages              # 创建联系留言
DELETE /api/contact-messages/{id}         # 删除联系留言
PATCH  /api/contact-messages/{id}/read    # 标记留言为已读
PATCH  /api/contact-messages/{id}/unread  # 标记留言为未读
```

### 9. 媒体资源接口

```
GET    /api/media                         # 获取媒体资源列表
GET    /api/media/{id}                    # 获取媒体资源详情
POST   /api/media                         # 上传媒体资源
DELETE /api/media/{id}                    # 删除媒体资源
GET    /api/media/download/{id}           # 下载媒体资源
```

## 前后端交互方式

前后端交互主要通过RESTful API进行，遵循以下规范：

1. **统一响应格式**

```json
{
  "code": 200,        // 状态码
  "message": "操作成功", // 消息
  "data": {}         // 返回数据
}
```

2. **认证方式**

采用JWT(JSON Web Token)方式进行认证，流程如下：
- 用户登录后获取token
- 前端将token存储在localStorage或sessionStorage中
- 每次请求在header中添加Authorization: Bearer {token}
- token过期后，通过refresh_token获取新token

3. **数据交互格式**

- 请求参数：GET请求使用查询参数，POST/PUT/PATCH请求使用JSON格式的请求体
- 响应数据：统一使用JSON格式

4. **错误处理**

- 使用HTTP状态码表示请求状态
- 在响应体中提供详细的错误信息

5. **分页处理**

列表接口统一使用以下分页参数：

```
page: 当前页码，从1开始
size: 每页数据量
sort: 排序字段，如："createTime,desc"
```

响应格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "content": [],       // 数据列表
    "totalElements": 100, // 总数据量
    "totalPages": 10,    // 总页数
    "size": 10,         // 每页数据量
    "number": 1,        // 当前页码
    "first": true,      // 是否第一页
    "last": false       // 是否最后一页
  }
}
```

## 不明确的问题

1. **文件存储方式**: 系统中的媒体文件是存储在本地文件系统还是使用对象存储服务(如阿里云OSS、七牛云)？

2. **搜索功能实现**: 系统是否需要全文搜索能力？如果需要，是否考虑集成Elasticsearch？

3. **内容国际化**: 是否需要支持多语言内容管理？

4. **性能要求**: 系统需要支持多少并发用户？有哪些性能指标要求？

5. **缓存策略**: 对于高频访问内容，是使用本地缓存还是分布式缓存？

6. **安全机制**: 除了基本的认证和授权，是否需要其他安全机制，如防SQL注入、XSS防护、CSRF防护等？

7. **前端内容渲染**: 前端内容展示是通过客户端渲染还是服务端渲染？如果是客户端渲染，SEO如何处理？

8. **部署方案**: 系统将如何部署？是否考虑容器化(如Docker)？是否需要集群部署？

## 总结

本系统设计提供了一个完整的内容管理系统架构，包括前端Vue.js架构、后端Java Spring Boot架构、MyBatis数据持久层、MySQL数据库设计以及RESTful API接口设计。系统涵盖了产品中心、解决方案、咨询中心、案例展示、关于我们和联系我们等核心模块，提供了统一的数据结构和API接口。

通过前后端分离架构，系统具有良好的可维护性和可扩展性，同时使用Vue.js和Element Plus等现代前端技术栈可以提供良好的用户体验。后端使用Spring Boot和MyBatis能够保证系统的稳定性和性能，同时支持灵活的SQL操作。