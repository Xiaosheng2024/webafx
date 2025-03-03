// Database Migration Scripts for Enterprise Website & E-Commerce Admin Panel
// These scripts use Prisma Migrate to create and modify database tables

/**
 * This file contains migration scripts to set up the database structure for the admin panel
 * To use these migrations with Prisma:
 * 1. Make sure Prisma CLI is installed: npm install -g prisma
 * 2. Initialize Prisma in your project: npx prisma init
 * 3. Place the schema from admin_database_schema.prisma into your prisma/schema.prisma file
 * 4. Run migrations: npx prisma migrate dev --name init
 */

// The actual migration will be handled by Prisma based on the schema file
// Here we provide additional setup instructions and seed data scripts

/**
 * Seed data script - to be used with prisma db seed
 * Save this as prisma/seed.js in your project
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data if needed (comment out in production)
    // await clearDatabase();
    
    // 1. Create admin user
    const adminUser = await createAdminUser();
    console.log('Admin user created:', adminUser.email);
    
    // 2. Create product categories
    const categories = await createProductCategories();
    console.log(`Created ${categories.length} product categories`);
    
    // 3. Create article categories
    const articleCategories = await createArticleCategories();
    console.log(`Created ${articleCategories.length} article categories`);
    
    // 4. Create tags
    const tags = await createTags();
    console.log(`Created ${tags.length} tags`);
    
    // 5. Create sample products
    const products = await createSampleProducts(categories, tags);
    console.log(`Created ${products.length} sample products`);
    
    // 6. Create sample articles
    const articles = await createSampleArticles(articleCategories, tags, adminUser.id);
    console.log(`Created ${articles.length} sample articles`);
    
    // 7. Create sample case studies
    const caseStudies = await createSampleCaseStudies(tags, adminUser.id);
    console.log(`Created ${caseStudies.length} sample case studies`);
    
    // 8. Create product-content relationships
    await createProductContentRelationships(products, articles, caseStudies);
    console.log('Created product-content relationships');
    
    // 9. Create site settings
    await createSiteSettings();
    console.log('Created site settings');
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function clearDatabase() {
  // Delete data in reverse order of dependencies
  await prisma.adminActivity.deleteMany({});
  await prisma.siteSetting.deleteMany({});
  await prisma.tagsOnCases.deleteMany({});
  await prisma.tagsOnArticles.deleteMany({});
  await prisma.tagsOnProducts.deleteMany({});
  await prisma.productCaseRelation.deleteMany({});
  await prisma.productArticleRelation.deleteMany({});
  await prisma.productRelation.deleteMany({});
  await prisma.specification.deleteMany({});
  await prisma.productAttribute.deleteMany({});
  await prisma.productDocument.deleteMany({});
  await prisma.productVideo.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.inquiry.deleteMany({});
  await prisma.caseStudy.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.articleCategory.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.user.deleteMany({});
}

async function createAdminUser() {
  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  return await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
}

async function createProductCategories() {
  // Main categories
  const scanningEquipment = await prisma.productCategory.create({
    data: {
      name: 'Scanning Equipment',
      slug: 'scanning-equipment',
      description: 'Advanced scanning solutions for various industry applications',
      imageUrl: '/images/categories/scanning-equipment.jpg',
    },
  });
  
  const printingEquipment = await prisma.productCategory.create({
    data: {
      name: 'Printing Equipment',
      slug: 'printing-equipment',
      description: 'High-quality printing solutions for professional environments',
      imageUrl: '/images/categories/printing-equipment.jpg',
    },
  });
  
  const softwareServers = await prisma.productCategory.create({
    data: {
      name: 'Software & Servers',
      slug: 'software-servers',
      description: 'Software solutions and server systems for data management',
      imageUrl: '/images/categories/software-servers.jpg',
    },
  });
  
  const integratedSolutions = await prisma.productCategory.create({
    data: {
      name: 'Integrated Solutions',
      slug: 'integrated-solutions',
      description: 'Comprehensive integrated packaging and processing solutions',
      imageUrl: '/images/categories/integrated-solutions.jpg',
    },
  });
  
  // Subcategories for Scanning Equipment
  const barcodeScanners = await prisma.productCategory.create({
    data: {
      name: 'Barcode Scanners',
      slug: 'barcode-scanners',
      description: '1D and 2D barcode scanning devices',
      parentId: scanningEquipment.id,
    },
  });
  
  const documentScanners = await prisma.productCategory.create({
    data: {
      name: 'Document Scanners',
      slug: 'document-scanners',
      description: 'High-resolution scanners for document digitalization',
      parentId: scanningEquipment.id,
    },
  });
  
  // Subcategories for Printing Equipment
  const labelPrinters = await prisma.productCategory.create({
    data: {
      name: 'Label Printers',
      slug: 'label-printers',
      description: 'Industrial and commercial label printing solutions',
      parentId: printingEquipment.id,
    },
  });
  
  const receiptPrinters = await prisma.productCategory.create({
    data: {
      name: 'Receipt Printers',
      slug: 'receipt-printers',
      description: 'Point of sale receipt printing devices',
      parentId: printingEquipment.id,
    },
  });
  
  return [scanningEquipment, printingEquipment, softwareServers, integratedSolutions, barcodeScanners, documentScanners, labelPrinters, receiptPrinters];
}

async function createArticleCategories() {
  // Main article categories
  const news = await prisma.articleCategory.create({
    data: {
      name: 'Company News',
      slug: 'company-news',
      description: 'Latest updates and announcements from the company',
    },
  });
  
  const techArticles = await prisma.articleCategory.create({
    data: {
      name: 'Technical Articles',
      slug: 'technical-articles',
      description: 'In-depth technical information about our products and technologies',
    },
  });
  
  const industryInsights = await prisma.articleCategory.create({
    data: {
      name: 'Industry Insights',
      slug: 'industry-insights',
      description: 'Analysis and insights about current industry trends',
    },
  });
  
  return [news, techArticles, industryInsights];
}

async function createTags() {
  const tagNames = [
    { name: 'Barcode', slug: 'barcode' },
    { name: 'QR Code', slug: 'qr-code' },
    { name: 'RFID', slug: 'rfid' },
    { name: 'Mobile Scanning', slug: 'mobile-scanning' },
    { name: 'Label Printing', slug: 'label-printing' },
    { name: 'Industrial', slug: 'industrial' },
    { name: 'Retail', slug: 'retail' },
    { name: 'Warehouse', slug: 'warehouse' },
    { name: 'Healthcare', slug: 'healthcare' },
    { name: 'Logistics', slug: 'logistics' },
    { name: 'Manufacturing', slug: 'manufacturing' },
    { name: 'Cloud Solutions', slug: 'cloud-solutions' },
    { name: 'Data Management', slug: 'data-management' },
    { name: 'Automation', slug: 'automation' },
    { name: 'New Release', slug: 'new-release' },
  ];
  
  const tags = [];
  for (const tagData of tagNames) {
    const tag = await prisma.tag.create({
      data: tagData,
    });
    tags.push(tag);
  }
  
  return tags;
}

async function createSampleProducts(categories, tags) {
  const products = [];
  
  // Sample products for Barcode Scanners category
  const barcodeScannerCategory = categories.find(c => c.slug === 'barcode-scanners');
  
  // Product 1
  const product1 = await prisma.product.create({
    data: {
      name: 'ProScan X1 Handheld Scanner',
      slug: 'proscan-x1-handheld-scanner',
      description: 'Professional handheld barcode scanner with advanced scanning capabilities. Ideal for retail and warehouse environments.',
      categoryId: barcodeScannerCategory.id,
      price: 299.99,
      sku: 'SCN-X1-001',
      stockQuantity: 120,
      isPublished: true,
      publishDate: new Date(),
      featuredImageUrl: '/images/products/proscan-x1.jpg',
    },
  });
  
  // Add images to product 1
  await prisma.productImage.createMany({
    data: [
      {
        productId: product1.id,
        imageUrl: '/images/products/proscan-x1-front.jpg',
        altText: 'ProScan X1 Front View',
        displayOrder: 1,
      },
      {
        productId: product1.id,
        imageUrl: '/images/products/proscan-x1-angle.jpg',
        altText: 'ProScan X1 Angle View',
        displayOrder: 2,
      },
      {
        productId: product1.id,
        imageUrl: '/images/products/proscan-x1-side.jpg',
        altText: 'ProScan X1 Side View',
        displayOrder: 3,
      },
    ],
  });
  
  // Add specifications to product 1
  await prisma.specification.createMany({
    data: [
      {
        productId: product1.id,
        group: 'Physical',
        name: 'Dimensions',
        value: '16 x 7 x 4',
        unit: 'cm',
        displayOrder: 1,
      },
      {
        productId: product1.id,
        group: 'Physical',
        name: 'Weight',
        value: '235',
        unit: 'g',
        displayOrder: 2,
      },
      {
        productId: product1.id,
        group: 'Performance',
        name: 'Scan Rate',
        value: '100',
        unit: 'scans/sec',
        displayOrder: 3,
      },
      {
        productId: product1.id,
        group: 'Performance',
        name: 'Reading Distance',
        value: '0.5-30',
        unit: 'cm',
        displayOrder: 4,
      },
      {
        productId: product1.id,
        group: 'Connectivity',
        name: 'Interface',
        value: 'USB, Bluetooth 5.0',
        displayOrder: 5,
      },
      {
        productId: product1.id,
        group: 'Power',
        name: 'Battery Life',
        value: '12',
        unit: 'hours',
        displayOrder: 6,
      },
    ],
  });
  
  // Add documents to product 1
  await prisma.productDocument.createMany({
    data: [
      {
        productId: product1.id,
        documentUrl: '/documents/proscan-x1-manual.pdf',
        title: 'ProScan X1 User Manual',
        fileType: 'PDF',
        fileSize: 2500,
      },
      {
        productId: product1.id,
        documentUrl: '/documents/proscan-x1-spec-sheet.pdf',
        title: 'ProScan X1 Specification Sheet',
        fileType: 'PDF',
        fileSize: 1200,
      },
    ],
  });
  
  // Add tags to product 1
  const retailTag = tags.find(t => t.slug === 'retail');
  const barcodeTag = tags.find(t => t.slug === 'barcode');
  const warehouseTag = tags.find(t => t.slug === 'warehouse');
  
  await prisma.tagsOnProducts.createMany({
    data: [
      {
        productId: product1.id,
        tagId: retailTag.id,
      },
      {
        productId: product1.id,
        tagId: barcodeTag.id,
      },
      {
        productId: product1.id,
        tagId: warehouseTag.id,
      },
    ],
  });
  
  products.push(product1);
  
  // Product 2 - Add more sample products as needed
  // Create similar structure for other product categories
  
  return products;
}

async function createSampleArticles(categories, tags, authorId) {
  const articles = [];
  
  // Sample article 1
  const techCategory = categories.find(c => c.slug === 'technical-articles');
  
  const article1 = await prisma.article.create({
    data: {
      title: 'Choosing the Right Scanner for Your Warehouse Needs',
      slug: 'choosing-right-scanner-warehouse-needs',
      content: `<h2>Choosing the Right Scanner for Your Warehouse Needs</h2>
<p>In today's fast-paced logistics environment, selecting the appropriate scanning equipment can significantly impact warehouse efficiency and accuracy. This article explores the key factors to consider when choosing scanning solutions for warehouse operations.</p>

<h3>Understanding Your Scanning Requirements</h3>
<p>Before purchasing any scanning equipment, it's essential to understand your specific needs. Consider the following factors:</p>
<ul>
  <li>Scanning volume and frequency</li>
  <li>Types of codes you need to scan (1D, 2D, etc.)</li>
  <li>Environmental conditions (temperature, humidity, dust)</li>
  <li>Integration with existing warehouse management systems</li>
  <li>Mobility requirements</li>
</ul>

<h3>Key Scanner Types for Warehouse Applications</h3>
<p>Several scanner types excel in warehouse environments:</p>

<h4>1. Handheld Scanners</h4>
<p>Ideal for versatile scanning needs, handheld scanners offer flexibility and ease of use. Models like our ProScan X1 provide long battery life and rugged construction suitable for warehouse environments.</p>

<h4>2. Fixed-Mount Scanners</h4>
<p>Perfect for conveyor systems and automated scanning stations, fixed-mount scanners offer hands-free operation for high-volume scanning points.</p>

<h4>3. Wearable Scanners</h4>
<p>For operations requiring both scanning capability and free hands, wearable scanners improve worker productivity by eliminating the need to pick up and set down scanning devices.</p>

<h3>Conclusion</h3>
<p>The right scanning solution can transform your warehouse operations, improving accuracy and efficiency. Consider your specific requirements and environmental factors when making your selection.</p>
`,
      excerpt: 'A comprehensive guide to selecting the appropriate scanning equipment for warehouse operations, focusing on efficiency and operational needs.',
      categoryId: techCategory.id,
      authorId: authorId,
      featuredImageUrl: '/images/articles/warehouse-scanner-selection.jpg',
      isPublished: true,
      publishDate: new Date(),
    },
  });
  
  // Add tags to article 1
  const warehouseTag = tags.find(t => t.slug === 'warehouse');
  const barcodeTag = tags.find(t => t.slug === 'barcode');
  
  await prisma.tagsOnArticles.createMany({
    data: [
      {
        articleId: article1.id,
        tagId: warehouseTag.id,
      },
      {
        articleId: article1.id,
        tagId: barcodeTag.id,
      },
    ],
  });
  
  articles.push(article1);
  
  // Add more articles as needed following similar pattern
  
  return articles;
}

async function createSampleCaseStudies(tags, authorId) {
  const caseStudies = [];
  
  // Sample case study 1
  const caseStudy1 = await prisma.caseStudy.create({
    data: {
      title: 'Retail Giant Improves Inventory Accuracy by 35% with ProScan Implementation',
      slug: 'retail-giant-improves-inventory-accuracy-proscan',
      content: `<h2>Retail Giant Improves Inventory Accuracy by 35% with ProScan Implementation</h2>
<p>One of the nation's largest retail chains struggled with inventory management accuracy across their 500+ locations. Manual counting processes and outdated scanning equipment led to significant discrepancies between reported and actual inventory levels.</p>

<h3>The Challenge</h3>
<p>The retailer faced several critical challenges:</p>
<ul>
  <li>Inventory discrepancies averaging 12% across locations</li>
  <li>Long inventory counting times reducing staff productivity</li>
  <li>Difficulty tracking items through the supply chain</li>
  <li>Customer dissatisfaction due to out-of-stock situations</li>
</ul>

<h3>The Solution</h3>
<p>After a comprehensive assessment, we implemented a complete inventory management solution:</p>
<ul>
  <li>Deployed 2,500 ProScan X1 handheld scanners across all locations</li>
  <li>Integrated scanners with the retailer's existing inventory management system</li>
  <li>Customized scanning workflows to match operational requirements</li>
  <li>Provided comprehensive staff training on new equipment and procedures</li>
</ul>

<h3>The Results</h3>
<p>Within six months of implementation, the retailer experienced:</p>
<ul>
  <li>35% improvement in inventory accuracy (from 88% to 99%)</li>
  <li>42% reduction in time required for inventory counts</li>
  <li>28% decrease in out-of-stock situations</li>
  <li>$3.2 million in annual savings from reduced inventory carrying costs</li>
  <li>Significant improvement in customer satisfaction metrics</li>
</ul>

<h3>Conclusion</h3>
<p>The implementation of ProScan X1 scanners transformed the retailer's inventory management practices, delivering significant operational improvements and cost savings. The improved accuracy and efficiency continue to provide competitive advantages in the challenging retail market.</p>
`,
      excerpt: 'How a major retail chain dramatically improved inventory accuracy and reduced costs using our ProScan X1 scanning solution across 500+ locations.',
      clientName: 'Major Retail Chain',
      industry: 'Retail',
      challengeDesc: 'Inventory discrepancies averaging 12% across 500+ retail locations, leading to out-of-stock situations and customer dissatisfaction.',
      solutionDesc: 'Deployment of 2,500 ProScan X1 scanners integrated with existing inventory systems, along with customized workflows and comprehensive training.',
      resultDesc: '35% improvement in inventory accuracy, 42% reduction in counting time, and $3.2 million annual savings in carrying costs.',
      authorId: authorId,
      featuredImageUrl: '/images/case-studies/retail-inventory-case-study.jpg',
      isPublished: true,
      publishDate: new Date(),
    },
  });
  
  // Add tags to case study 1
  const retailTag = tags.find(t => t.slug === 'retail');
  const barcodeTag = tags.find(t => t.slug === 'barcode');
  const inventoryTag = tags.find(t => t.slug === 'inventory');
  
  if (retailTag && barcodeTag) {
    await prisma.tagsOnCases.createMany({
      data: [
        {
          caseId: caseStudy1.id,
          tagId: retailTag.id,
        },
        {
          caseId: caseStudy1.id,
          tagId: barcodeTag.id,
        },
      ],
    });
  }
  
  caseStudies.push(caseStudy1);
  
  // Add more case studies as needed following similar pattern
  
  return caseStudies;
}

async function createProductContentRelationships(products, articles, caseStudies) {
  // Only proceed if we have products, articles, and case studies
  if (products.length > 0 && articles.length > 0 && caseStudies.length > 0) {
    // Relate product to article
    await prisma.productArticleRelation.create({
      data: {
        productId: products[0].id,
        articleId: articles[0].id,
      },
    });
    
    // Relate product to case study
    await prisma.productCaseRelation.create({
      data: {
        productId: products[0].id,
        caseId: caseStudies[0].id,
      },
    });
  }
}

async function createSiteSettings() {
  await prisma.siteSetting.createMany({
    data: [
      {
        key: 'site_name',
        value: 'Enterprise Technology Solutions',
        group: 'general',
        description: 'Website name displayed in browser title and headers',
      },
      {
        key: 'site_description',
        value: 'Professional scanning equipment, printing solutions, and integrated systems for enterprise applications',
        group: 'general',
        description: 'Meta description for SEO purposes',
      },
      {
        key: 'contact_email',
        value: 'info@example.com',
        group: 'contact',
        description: 'Primary contact email address',
      },
      {
        key: 'contact_phone',
        value: '+1 (555) 123-4567',
        group: 'contact',
        description: 'Primary contact phone number',
      },
      {
        key: 'social_facebook',
        value: 'https://facebook.com/enterprisetech',
        group: 'social',
        description: 'Facebook page URL',
      },
      {
        key: 'social_linkedin',
        value: 'https://linkedin.com/company/enterprisetech',
        group: 'social',
        description: 'LinkedIn page URL',
      },
      {
        key: 'homepage_hero_title',
        value: 'Advanced Technology Solutions for Enterprise',
        group: 'homepage',
        description: 'Main headline on homepage hero section',
      },
      {
        key: 'homepage_hero_subtitle',
        value: 'Innovative scanning, printing, and integrated solutions for modern businesses',
        group: 'homepage',
        description: 'Subtitle on homepage hero section',
      },
    ],
  });
}

// Export the seed function for Prisma to use
module.exports = seedDatabase;