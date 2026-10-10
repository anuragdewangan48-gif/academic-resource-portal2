# 📦 File Storage Architecture & MongoDB Limitations Guide
### Academic Resource & PYQ Portal (AcademiaPYQ)

---

## 📌 1. Executive Summary: The Golden Rule of File Storage

> **The Golden Rule:**  
> **"Store structured metadata in the database; store binary files in dedicated object storage or file systems."**

When building web applications that handle files (such as PDF question papers, PowerPoint lecture slides, Word documents, or ZIP lab packages), one of the most common beginner questions is:

> *"Should I store the actual PDF binary file inside MongoDB, or should I save it as a file on disk/cloud and only store its URL/path in MongoDB?"*

**The short answer:** Always store the **file metadata and storage URL/path in MongoDB**, while saving the **actual file binary** in external storage (such as a local `/uploads` directory in development, or an Object Store like AWS S3, Cloudflare R2, Google Cloud Storage, or Cloudinary in production).

This guide explains why this architecture is industry standard, how the file upload pipeline works end-to-end in this portal, and the technical limitations of MongoDB regarding file storage.

---

## 🚀 2. How File Uploading Works End-to-End

Here is the complete step-by-step lifecycle of a study paper or PYQ file uploaded to the AcademiaPYQ portal:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   1. BROWSER (CLIENT)                                  │
│                                                                                        │
│  User drags & drops "DBMS_PYQ_2024.pdf" into Dropzone                                  │
│  - Client verifies file extension (.pdf, .docx, .zip)                                  │
│  - Client checks file size (<= 50 MB)                                                  │
│  - Bundles file & fields into FormData                                                 │
│  - Monitors upload progress via XMLHttpRequest.upload.onprogress (0% -> 100%)          │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP POST /api/resources
                                            │ (Content-Type: multipart/form-data)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               2. EXPRESS SERVER & MULTER                               │
│                                                                                        │
│  Multer middleware intercepts the incoming multipart stream:                           │
│  - Generates safe unique filename: Date.now() + cleanName                              │
│    e.g. "1741200000000-DBMS_PYQ_2024.pdf"                                             │
│  - Streams binary data into disk: path.join(process.cwd(), 'uploads', filename)        │
│  - Populates req.file (metadata) and req.body (form fields)                            │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        3. CONTROLLER & DATABASE PERSISTENCE                            │
│                                                                                        │
│  Express Controller (resourceController.ts):                                           │
│  - Resolves target file URL: "/uploads/1741200000000-DBMS_PYQ_2024.pdf"               │
│  - Saves lightweight JSON document into MongoDB:                                       │
│    {                                                                                   │
│      title: "DBMS End-Sem Solved PYQ 2024",                                            │
│      branch: "CSE",                                                                    │
│      semester: 4,                                                                      │
│      category: "PYQ",                                                                  │
│      fileUrl: "/uploads/1741200000000-DBMS_PYQ_2024.pdf",                             │
│      upvotes: 0,                                                                       │
│      createdAt: ISODate("2026-03-14T...")                                              │
│    }                                                                                   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        4. FILE VIEWING & DOWNLOADING BY USERS                          │
│                                                                                        │
│  Students click "Open / View":                                                         │
│  - Request: GET /api/resources/:id/view                                                │
│  - Server checks if physical file exists in /uploads/                                  │
│  - Sets header: Content-Type: application/pdf; Content-Disposition: inline             │
│  - Browser renders PDF directly inside the tab                                         │
│                                                                                        │
│  Students click "Download":                                                            │
│  - Request: GET /api/resources/:id/download                                            │
│  - Server sets Content-Disposition: attachment; filename="DBMS_PYQ_2024.pdf"           │
│  - Browser initiates native download dialog                                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ 3. MongoDB Storage Limitations (The 16MB BSON Hard Limit)

MongoDB stores data in **BSON** (Binary JSON) format. There is a strict architectural constraint:

### 1. The 16MB Maximum BSON Document Size
- A single MongoDB document **cannot exceed 16 megabytes (16,777,216 bytes)**.
- If you attempt to save a document whose raw fields plus binary content exceed 16MB, MongoDB immediately rejects the write with:
  ```
  BSONObjectTooLarge: Document size is larger than maximum 16777216.
  ```
- **Academic Impact:** A comprehensive textbook PDF, a bundle of high-resolution past exam question scans, or a zip file of semester laboratory projects regularly ranges between 20MB and 200MB. They simply cannot fit into a standard MongoDB document!

### 2. RAM & Working Set Cache Thrashing (WiredTiger Cache)
- MongoDB keeps frequently accessed documents in RAM using the **WiredTiger cache**.
- When you store 10MB or 15MB binary buffers directly in database documents, fetching a single document forces MongoDB to pull 15MB into RAM.
- This immediately kicks out frequently queried indexes, user authentication tables, and metadata records from RAM, causing massive disk I/O bottlenecks and slowing down all database queries across your entire portal.

### 3. Network Bandwidth & Query Bloat
- When the frontend queries the list of resources (`GET /api/resources`):
  - With **metadata/fileUrl**: MongoDB returns a 500-byte JSON object. A page of 20 resources consumes only **10 KB** of bandwidth.
  - With **embedded binary data**: A page of 20 resources would pull **200 MB** over the wire every time someone refreshes the homepage!

### 4. Database Backup & Replication Degradation
- MongoDB replica sets replicate changes via the **oplog** (operations log).
- Large document writes flood the oplog, causing replication lag across database nodes and making database dumps (`mongodump`) gigabytes larger than necessary.

---

## 📊 4. Storage Architecture Comparison

| Feature / Criteria | 📁 Local Filesystem (`/uploads`) | 🗄️ MongoDB GridFS | ☁️ Cloud Object Storage (AWS S3 / Cloudflare R2 / GCS) |
| :--- | :--- | :--- | :--- |
| **How it works** | Files saved to server disk, path saved in MongoDB | MongoDB splits file into 255KB chunks across `fs.files` & `fs.chunks` | Files saved in cloud bucket, CDN URL saved in MongoDB |
| **Max File Size** | Limited only by disk space | Up to 16 TB per file | Up to 5 TB per file |
| **Setup Complexity** | Very Simple (Built into Node.js + Multer) | Medium (Requires Mongoose GridFSBucket driver) | Low-to-Medium (Requires cloud credentials) |
| **RAM / Database Impact** | **Zero** impact on MongoDB | High (Puts file chunks in database storage) | **Zero** impact on MongoDB |
| **CDN & Edge Caching** | Requires manual reverse proxy / Nginx | Not natively supported | **Built-in** (Cloudflare, CloudFront, fast global downloads) |
| **Horizontal Scaling** | Difficult if running multiple server containers | Works across containers | **Perfect** (Stateless servers can scale to 100+ instances) |
| **Best For** | Development, prototypes, single-VPS deployments | Restricted environments where no cloud bucket is allowed | **Production applications at scale** |

---

## 🛠️ 5. How Our Portal Implements Reliable Local Storage

In this project, we utilize the **Local Storage + URL Pointer Pattern**:

1. **Multer Disk Configuration (`server/routes/resourceRoutes.ts`)**:
   ```typescript
   import multer from 'multer';
   import path from 'path';
   import fs from 'fs';

   const storage = multer.diskStorage({
     destination: (_req, _file, cb) => {
       const uploadPath = path.join(process.cwd(), 'uploads');
       if (!fs.existsSync(uploadPath)) {
         fs.mkdirSync(uploadPath, { recursive: true });
       }
       cb(null, uploadPath);
     },
     filename: (_req, file, cb) => {
       // Sanitize file name and add millisecond timestamp to guarantee uniqueness
       const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
       const uniqueName = `${Date.now()}-${cleanName}`;
       cb(null, uniqueName);
     },
   });

   export const upload = multer({
     storage,
     limits: { fileSize: 50 * 1024 * 1024 }, // 50MB maximum size limit
   });
   ```

2. **Static Asset Serving (`server.ts`)**:
   ```typescript
   // Serves physical files at http://localhost:3000/uploads/<filename>
   app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
   ```

3. **Controller Handling with Mongoose (`server/controllers/resourceController.ts`)**:
   ```typescript
   // Store only the lightweight URL pointer in MongoDB:
   const newResource = await Resource.create({
     title: req.body.title,
     branch: req.body.branch,
     semester: req.body.semester,
     category: req.body.category,
     fileUrl: `/uploads/${req.file.filename}`, // Lightweight string pointer
   });
   ```

4. **Self-Healing Fallback Guarantee**:
   Even if a user runs in an ephemeral container where physical files on disk get cleaned on reboot, the controller includes a fallback generator (`generateAcademicDocumentHtml`) that automatically reconstructs complete academic paper syllabuses and answer structures so links **never break**!

---

## ☁️ 6. Upgrading to Cloud Storage (Production AWS S3 / Cloudflare R2)

When deploying your university portal to production with multiple load-balanced server instances, you can easily switch the storage engine from local disk to an S3-compatible cloud object bucket:

### Example: Using AWS S3 or Cloudflare R2 with Multer S3

1. Install the S3 client:
   ```bash
   npm install @aws-sdk/client-s3 multer-s3
   ```

2. Configure `uploadMiddleware.ts`:
   ```typescript
   import { S3Client } from '@aws-sdk/client-s3';
   import multer from 'multer';
   import multerS3 from 'multer-s3';

   const s3 = new S3Client({
     region: process.env.AWS_REGION || 'us-east-1',
     credentials: {
       accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
     },
   });

   export const cloudUpload = multer({
     storage: multerS3({
       s3: s3,
       bucket: process.env.AWS_S3_BUCKET_NAME!,
       acl: 'public-read',
       contentType: multerS3.AUTO_CONTENT_TYPE,
       key: (_req, file, cb) => {
         const uniqueKey = `resources/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
         cb(null, uniqueKey);
       },
     }),
     limits: { fileSize: 50 * 1024 * 1024 },
   });
   ```

3. In your controller, simply save the returned S3 URL:
   ```typescript
   // req.file.location contains the full CDN link:
   // e.g. "https://my-university-bucket.s3.amazonaws.com/resources/1741200000000-paper.pdf"
   const fileUrl = (req.file as any).location;
   await Resource.create({ ...metadata, fileUrl });
   ```

---

## 🎯 7. Key Takeaways for Developers

1. **Never store raw PDFs or images in MongoDB documents**: Storing files directly in BSON documents hits the 16MB barrier and degrades database performance.
2. **Always validate on both sides**:
   - Client-side: Validate file type and size immediately to provide instant feedback and avoid wasted upload bandwidth.
   - Server-side: Enforce file size limits in Multer (`limits: { fileSize: 50 * 1024 * 1024 }`) to prevent Denial-of-Service (DoS) attacks.
3. **Use unique filenames**: Prefix filenames with timestamps (`Date.now()`) or UUIDs to prevent user uploads from overwriting existing files with the same name.
4. **Use Content-Disposition appropriately**:
   - `inline`: Tells the browser to open and render the document inside the browser tab (ideal for quick reading).
   - `attachment; filename="..."`: Tells the browser to download the file directly to the user's hard drive.

---
*Created for the Academic Resource & PYQ Portal by Anurag Dewangan and Team (Sudeeshna, Abhinav Kanwar, Dimple Stylee, Pavani Yadav).*
