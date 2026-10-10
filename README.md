# 📚 Academic Resource & PYQ Portal (AcademiaPYQ)

Welcome to the **Academic Resource & Past Year Questions (PYQ) Portal**! 
link :

This web application is an all-in-one university hub designed to help engineering and college students easily browse, search, and download verified semester examination question papers, lecture notes, syllabus sheets, and lab manuals. It also includes an integrated AI study assistant powered by Google Gemini and an administrative control panel for university moderators.

---

## 📖 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [How the Technologies Work Together (Architecture)](#3-how-the-technologies-work-together-architecture)
4. [How the APIs Work (Endpoints & Examples)](#4-how-the-apis-work-endpoints--examples)
5. [Getting Started & Setup Instructions](#5-getting-started--setup-instructions)
6. [Project Folder Structure](#6-project-folder-structure)
7. [Database Connection & File Storage Architecture (Comprehensive Guide)](#7-database-connection--file-storage-architecture-comprehensive-guide)
   - [7.1 MongoDB Atlas Connection & Mongoose Setup](#71-mongodb-atlas-connection--mongoose-setup)
   - [7.2 File Saving Mechanism & The 16MB BSON Document Limit](#72-file-saving-mechanism--the-16mb-bson-document-limit)
   - [7.3 End-to-End File Workflow: From Drag-and-Drop to Student Download](#73-end-to-end-file-workflow-from-drag-and-drop-to-student-download)

---

## 1. Project Overview

Finding semester question papers and subject notes right before exams is often difficult when materials are scattered across chat groups and shared drives. This portal centralizes all university materials in a single, well-structured repository.

### Key Features:
- **Interactive Drag-and-Drop File Upload**: Admins and contributors can drag and drop study notes, lecture slides, and PYQ documents directly into an intuitive drop zone with instant file preview, size calculation, and live upload progress tracking.
- **Reliable File Persistence & Delivery**: Uploaded files are safely stored on the server's disk repository and served with proper inline browser viewing (PDF reader) or direct device download options.
- **Branch-Wise Organization**: Dedicated streams for **Computer Science (CSE)**, **Data Science & AI (DSAI)**, and **Electronics & Communication (ECE)**, with semester and subject code filters.
- **Role-Based Access Control (RBAC)**:
  - **Student View**: Passwordless, instant entry. Students can browse, filter, upvote, download materials, and ask questions to the AI study assistant.
  - **Admin View**: Protected by an `ADMIN_SECRET_KEY`. Moderators can delete obsolete/spam files, restore default database seeds, and view live system metrics.
- **Slide-Out Sidebar (Drawer)**: A clean menu that slides in from the left containing branch filters, navigation links, and a dedicated **Logout & Switch Role** button.
- **Minimalist Top Navigation Bar**: Features an uncluttered header with the portal brand, a quick search input, and a hamburger icon to toggle the sidebar.
- **Modal Login & Role Gate**: A centered modal with backdrop blur for selecting between Student and Admin mode.

---

## 2. Tech Stack

The portal is built using a modern full-stack JavaScript/TypeScript architecture. Below is a beginner-friendly explanation of each technology used:

### 🎨 Frontend (What users see in their web browser)
- **HTML5**: Provides the structural skeleton and layout of the web pages.
- **JavaScript & React**: Powers the dynamic and interactive user experience. Instead of reloading the page on every click, React smoothly updates only the parts of the screen that change (like filtering notes or opening modals).
- **Tailwind CSS**: A utility-first CSS styling framework. It allows us to style buttons, cards, drawers, and layouts directly using simple class names for clean spacing, modern colors, and responsive mobile-first design.

### ⚙️ Backend (The server logic and operations)
- **Node.js**: A runtime environment that allows JavaScript and TypeScript code to run on a server instead of just inside a web browser.
- **Express.js**: A fast, minimalist web framework for Node.js. It listens for requests from the browser, runs routing logic (like `/api/resources`), checks permissions, and sends back responses.
- **TypeScript & `tsx`**: TypeScript adds static types to JavaScript to catch bugs early. The `tsx` runner lets us execute TypeScript backend files directly (`server.ts`) without manual pre-compilation steps during development.

### 🗄️ Database (Where data is stored permanently)
- **MongoDB**: A NoSQL document database. Instead of traditional SQL tables and rows, MongoDB stores data in flexible, JSON-like objects called documents (e.g., each study note or question paper is a document).
- **Mongoose**: An Object Data Modeling (ODM) library for MongoDB and Node.js. It acts as a translator between our Express code and the MongoDB database, defining schemas (rules for what fields each resource must have, such as `title`, `branch`, `semester`, and `fileUrl`).

---

## 3. How the Technologies Work Together (Architecture)

The application follows the classic **Client-Server-Database** model. Here is how information travels when a student opens the website:

```
┌─────────────────┐       HTTP Requests (JSON)       ┌─────────────────┐       Queries & Updates       ┌──────────────────┐
│                 │ ───────────────────────────────> │                 │ ────────────────────────────> │                  │
│  User's Browser │                                  │  Express Server │                               │  MongoDB Atlas   │
│ (React/Tailwind)│ <─────────────────────────────── │  (Node.js / tsx)│ <──────────────────────────── │ (Document Store) │
└─────────────────┘        JSON Data / Status        └─────────────────┘         Raw Documents         └──────────────────┘
```

### Step-by-Step Flow:
1. **User Action (Client/Frontend)**: A student selects the "CSE" branch tab or searches for "CS201" in their browser.
2. **Sending the Request**: The frontend makes an asynchronous HTTP request (e.g., `GET /api/resources?branch=CSE`) to our Express backend.
3. **Server Processing (Backend)**: The Express server receives the request, identifies the requested URL and query parameters, and passes them to our resource controller.
4. **Database Query (Database)**: The controller calls Mongoose to query MongoDB: `Resource.find({ branch: "CSE" })`.
5. **Database Response**: MongoDB returns an array of matching document records back to the Express server.
6. **Sending Back to Client**: The Express server formats the result as a JSON response and sends it back with an HTTP `200 OK` status code.
7. **UI Update**: The React frontend receives the JSON data and instantly updates the card grid on screen with smooth transitions—no full page reload required!

*(Note: If no external MongoDB connection is provided, the backend automatically operates with an in-memory fallback store so all features continue working seamlessly.)*

---

## 4. How the APIs Work (Endpoints & Examples)

All communication between the frontend and the backend happens through RESTful API endpoints. Here are the core endpoints explained in plain English:

### 1. Admin Verification & Login
- **Endpoint**: `POST /api/admin/verify` (or `POST /api/admin/login`)
- **What it does**: Checks if the secret key entered by a user matches the server's `ADMIN_SECRET_KEY`.
- **Sample Request**:
  ```json
  POST /api/admin/verify
  Content-Type: application/json

  {
    "adminKey": "academia-admin-secret-2026"
  }
  ```
- **Sample Response (Success - 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Admin authenticated successfully.",
    "role": "admin"
  }
  ```
- **Sample Response (Failure - 401 Unauthorized)**:
  ```json
  {
    "success": false,
    "error": "Invalid Admin Secret Key. Access denied."
  }
  ```

---

### 2. Fetching Academic Resources
- **Endpoint**: `GET /api/resources`
- **What it does**: Retrieves study materials based on optional filter parameters like `branch`, `category`, `semester`, and `search`.
- **Sample Request**:
  ```
  GET /api/resources?branch=CSE&category=PYQ&semester=3
  ```
- **Sample Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
        "title": "Data Structures & Algorithms End-Semester Exam 2024",
        "subjectCode": "CS201",
        "branch": "CSE",
        "semester": 3,
        "category": "PYQ",
        "year": 2024,
        "upvotes": 42,
        "fileUrl": "https://example.com/papers/cs201-2024.pdf",
        "createdAt": "2026-03-01T10:00:00.000Z"
      }
    ]
  }
  ```

---

### 3. Upvoting a Resource
- **Endpoint**: `POST /api/resources/:id/upvote`
- **What it does**: Increments the helpfulness counter on a study document so the highest-quality papers rise to the top.
- **Response**: Returns the updated resource object with the incremented upvote count.

---

### 4. Deleting a Resource (Admin Only)
- **Endpoint**: `DELETE /api/admin/resources/:id`
- **Headers Required**: `x-admin-key: <ADMIN_SECRET_KEY>`
- **What it does**: Permanently removes an outdated or spam material from the database.

---

## 5. Getting Started & Setup Instructions

Follow these step-by-step instructions to run the project on your local computer:

### Prerequisites:
- **Node.js**: Make sure Node.js (version 18 or higher) is installed on your computer. You can check by running `node -v` in your terminal.
- **Git** (optional, for cloning): To clone the repository to your machine.

---

### Step 1: Clone or Open the Project
Open your terminal or command prompt and navigate to the project folder:
```bash
cd academic-resource-portal
```

---

### Step 2: Install Dependencies
Install the required packages using npm:
```bash
npm install
```
*(If setting up manually from scratch, the core server packages can be installed with: `npm install express mongoose dotenv` and `npm install -D tsx typescript @types/node @types/express`)*

---

### Step 3: Configure Environment Variables (`.env`)
Create a file named `.env` in the root folder of your project (you can copy the provided `.env.example`):

```env
# Port for the server (defaults to 3000)
PORT=3000

# MongoDB Database Connection String
# You can use a free MongoDB Atlas cloud URI or a local MongoDB database:
MONGODB_URI=mongodb://localhost:27017/academic_portal

# Admin Secret Key (used to unlock administrative moderation tools)
ADMIN_SECRET_KEY=academia-admin-secret-2026

# Optional: Google Gemini API Key for AI study summaries
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: If you don't have MongoDB installed yet, don't worry! The application automatically falls back to an in-memory mode so you can run and test everything immediately without configuring a database server.

---

### Step 4: Run the Development Server
Start the server using `tsx`:
```bash
npx tsx server.ts
```
*(Or use the npm script shortcut)*:
```bash
npm run dev
```

You should see output similar to:
```
==================================================
  AcademiaPYQ Server running on http://localhost:3000
  Mode: In-Memory / MongoDB Connected
==================================================
```

---

### Step 5: Open the Application
Open your web browser (Chrome, Firefox, Safari, or Edge) and go to:
```
http://localhost:3000
```
- Select **Student** to browse course papers, download notes, and test the search bar.
- Select **Admin** and enter the secret key (`academia-admin-secret-2026`) to explore the administrative moderation panel.

---

## 6. Project Folder Structure

A quick guide to what each folder and file does:

```
├── server.ts                     # Main Express backend server entry point
├── server/
│   ├── config/db.ts              # MongoDB & Mongoose connection configuration
│   ├── controllers/              # Business logic (adminController, resourceController)
│   ├── middleware/adminAuth.ts   # Security middleware verifying ADMIN_SECRET_KEY
│   ├── models/                   # Mongoose schemas (Resource.ts, User.ts)
│   └── routes/                   # API route handlers (/api/resources, /api/admin)
├── src/
│   ├── App.tsx                   # Main React frontend component and view router
│   ├── main.tsx                  # React entry point mounting to index.html
│   ├── components/
│   │   ├── Navbar.tsx            # Minimalist top header with quick search & menu toggle
│   │   ├── SidebarDrawer.tsx     # Slide-out drawer with branch filters and logout
│   │   ├── RoleSelectionModal.tsx# Centered modal for Student vs Admin selection
│   │   ├── ResourceBrowser.tsx   # Core academic cards grid and semester filters
│   │   ├── ResourceCard.tsx      # Individual note / PYQ card with upvotes and AI helper
│   │   ├── AdminDashboard.tsx    # Admin control panel for resource moderation
│   │   ├── AiHelperModal.tsx     # Gemini AI study assistant modal
│   │   └── UploadForm.tsx        # Upload form with drag-and-drop zone & live progress
│   └── services/api.ts           # Frontend HTTP client communicating with /api/*
├── uploads/                      # Local physical storage directory for uploaded notes/PYQs
├── FILE_STORAGE_GUIDE.md         # Detailed guide on MongoDB 16MB limits & file storage strategies
├── package.json                  # Project dependencies and npm scripts
├── .env.example                  # Template of required environment variables
└── README.md                     # You are here! Complete project documentation
```

---

## 7. Database Connection & File Storage Architecture (Comprehensive Guide)

Understanding how database persistence and file storage integrate is one of the most critical engineering concepts in full-stack web development. This section explains the architecture in simple, beginner-friendly terms.

---

### 7.1 MongoDB Atlas Connection & Mongoose Setup

#### ❓ Should we connect our application directly to MongoDB Atlas?
**Yes.** MongoDB Atlas is a fully managed cloud database service hosted by MongoDB. Connecting our Express backend to MongoDB Atlas ensures that student upvotes, user profiles, lecture notes, and question paper metadata remain permanently stored across server reboots, container updates, and multi-user sessions.

#### 🛠️ How Mongoose Establishes the Connection
Instead of writing raw database commands, our Node.js/Express backend uses **Mongoose** (an Object Data Modeling library). Mongoose acts as a smart bridge:
1. It validates incoming data against TypeScript/Mongoose schemas before writing to the database.
2. It manages an **automatic connection pool** (multiple reusable socket connections), meaning the server doesn't incur the latency overhead of re-authenticating with Atlas on every incoming user click.
3. It provides resilience: our server connects smoothly to Atlas if `MONGODB_URI` is provided, while safely falling back to an in-memory preview cache if running offline or during initial configuration.

#### 💻 Production Connection Code (`server/config/db.ts`)
Below is the exact mechanism and code used by our application to establish a stable connection with MongoDB Atlas:

```typescript
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Connects the Express server to MongoDB Atlas using Mongoose.
 * Features automatic pooling, error handling, and connection lifecycle logging.
 */
export async function connectDB(): Promise<void> {
  // 1. Read the connection string from environment variables
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/academic_portal';

  try {
    // 2. Enforce strict query filtering to prevent injection of unmodeled fields
    mongoose.set('strictQuery', true);

    console.log('[Database] Connecting to MongoDB Atlas cluster...');

    // 3. Connect with robust timeout options
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if Atlas is unreachable
      maxPoolSize: 10,                 // Maintain up to 10 concurrent socket connections
      socketTimeoutMS: 45000,          // Close inactive sockets after 45s of idle time
    });

    console.log(`✅ [Database] Successfully connected to MongoDB at: ${mongoose.connection.host}`);
  } catch (error: any) {
    // Graceful error logging so the server does not crash unexpectedly
    console.warn(`⚠️ [Database Warning] Could not reach MongoDB Atlas: ${error.message}`);
    console.warn(`ℹ️ [Database Info] Operating with in-memory fallback cache for preview.`);
  }

  // 4. Listen to connection lifecycle events
  mongoose.connection.on('connected', () => {
    console.log('📡 [Database] Connection established with database cluster.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌ [Database Error] Runtime connection issue: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🔌 [Database] Disconnected from MongoDB cluster.');
  });
}

/**
 * Utility function to check if the database is currently connected
 */
export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1; // 1 = connected
}
```

#### 🔑 Connection String Configuration (`.env`)
To point your portal to your personal MongoDB Atlas database:
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and click **"Connect"** on your cluster.
2. Select **"Connect your application"** with Node.js driver.
3. Paste the URI into your `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster0.abcde.mongodb.net/academia_portal?retryWrites=true&w=majority
   ```

---

### 7.2 File Saving Mechanism & The 16MB BSON Document Limit

#### ❓ When an admin uploads a PDF or study note, where does the physical file go?
> **The Golden Architectural Rule:**  
> **"Store structured metadata in the database; store heavy binary files in dedicated object storage or file systems."**

In our portal, **MongoDB does NOT store the raw binary file (the PDF bytes).** Instead:
- **Physical File (`DBMS_PYQ_2024.pdf`, 14 MB):** Physically saved on disk in the server's `/uploads` folder (or in production, uploaded to an S3-compatible cloud object storage bucket such as AWS S3 or Cloudflare R2).
- **Database Record (~500 bytes JSON):** MongoDB stores a lightweight document containing the metadata (`title`, `branch`, `semester`, `subjectCode`, `upvotes`) and a reference string pointer (`fileUrl: "/uploads/1741200000000-DBMS_PYQ_2024.pdf"`).

#### ⚠️ Why Can't We Just Save the PDF Directly in MongoDB?
Beginners often ask why we cannot simply put the PDF inside a MongoDB document as binary data. There are four critical technical reasons:

1. **MongoDB's 16MB BSON Hard Limit:**
   MongoDB documents are encoded as **BSON** (Binary JSON). MongoDB strictly enforces a **16 Megabyte (16,777,216 bytes) maximum size limit per document**. 
   - A single multi-page handwritten notes package, high-resolution past exam scan, or semester syllabus book regularly exceeds 16MB, 30MB, or even 80MB.
   - If you attempt to save a file larger than 16MB directly in a document, MongoDB will immediately crash the write operation with:
     ```text
     BSONObjectTooLarge: Document size is larger than maximum 16777216.
     ```

2. **RAM & Cache Thrashing (WiredTiger Engine):**
   MongoDB maintains an in-memory cache (**WiredTiger**) to keep frequently accessed indexes and records in lightning-fast RAM. If 10MB PDF documents are kept in MongoDB, querying a few resources pushes out all user authentication records and indexes from RAM to disk, drastically slowing down the entire website.

3. **Network Bloat & Excessive Bandwidth:**
   When a student opens the homepage to browse resources (`GET /api/resources`):
   - **With the Metadata-Pointer Pattern:** MongoDB returns a lightweight JSON array. 20 resources require only **~10 KB** of bandwidth.
   - **With Embedded Raw PDFs:** Fetching that same list of 20 resources would force the server to download **200 MB to 500 MB** of binary data on every single page refresh!

4. **Database Backup & Replication Bottlenecks:**
   MongoDB replica sets synchronize changes through the **oplog** (operations log). Giant binary writes choke the oplog, causing replication lag across database nodes and making database backups (`mongodump`) balloon unnecessarily into tens of gigabytes.

---

### 7.3 End-to-End File Workflow: From Drag-and-Drop to Student Download

Here is the complete, step-by-step lifecycle of how a study paper flows through the system:

```
[ Step 1: Admin Drag & Drop ]
            │
            ▼ (multipart/form-data HTTP POST)
[ Step 2: Express Server & Multer Middleware ]
            │
            ├───────────────────────────────────────────┐
            ▼                                           ▼
[ Step 3: Physical Disk / Cloud Storage ]   [ Step 4: MongoDB Atlas ]
  • File: /uploads/1741...-OS_PYQ.pdf         • Document: { title, branch, fileUrl }
  • Size: 8.5 MB                              • Size: 480 Bytes
            │                                           │
            └─────────────────────┬─────────────────────┘
                                  ▼
[ Step 5: Student Browse, View & Download ]
  • Filter by Branch & Semester (MongoDB indexed query)
  • "Open/View": Browser streams PDF inline in tab
  • "Download": Browser triggers direct file download
```

#### Detailed Step-by-Step Walkthrough:

#### Step 1: Admin drags and drops a file into the upload zone
- The admin navigates to the portal, opens the upload modal, and drags a file (e.g., `Operating_Systems_PYQ_2024.pdf`) into the interactive dropzone.
- The client-side React code validates the file format (`.pdf`, `.docx`, `.pptx`, `.txt`, `.zip`) and ensures the file size does not exceed **50 MB**.
- The frontend wraps the file along with the form fields (`title`, `branch`, `semester`, `subjectCode`, `category`) into a standard browser `FormData` object.
- The upload begins via `XMLHttpRequest`, giving the admin real-time visual progress feedback (e.g., `35%`, `78%`, `100%`).

#### Step 2: Backend Express server receives and processes the upload
- The incoming HTTP request arrives at `POST /api/resources` with the header `Content-Type: multipart/form-data`.
- **Multer Middleware** (`server/routes/resourceRoutes.ts`) intercepts the multipart stream before it reaches the controller logic:
  ```typescript
  // Multer safely generates a unique filename to prevent overwriting files with identical names
  const uniqueFilename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  ```

#### Step 3: Physical storage destination (Local Directory or Cloud Storage)
- **Local Directory Mapping (Current Setup):** Multer streams the binary file chunks directly onto the server's filesystem in the `uploads/` folder:
  ```
  uploads/1741200000000-Operating_Systems_PYQ_2024.pdf
  ```
  The Express server statically serves this folder via `app.use('/uploads', express.static(uploadsDir))`.
- **Production Cloud Storage (AWS S3 / Cloudflare R2):** If scaled for horizontal multi-server deployments, the Multer S3 storage engine streams the file directly to an Amazon S3 or Cloudflare R2 bucket and returns a CDN URL (e.g., `https://cdn.university-portal.edu/resources/...`).

#### Step 4: Saving file metadata and reference links in MongoDB
- With the physical file safely written to disk, the controller (`server/controllers/resourceController.ts`) executes a Mongoose create query:
  ```typescript
  // Create a clean, lightweight metadata record in MongoDB
  const newResource = await Resource.create({
    title: req.body.title,
    branch: req.body.branch,         // e.g. "CSE"
    semester: Number(req.body.semester), // e.g. 4
    courseType: req.body.courseType, // e.g. "Core Theory"
    subjectCode: req.body.subjectCode, // e.g. "CS402"
    category: req.body.category,     // e.g. "PYQ"
    fileUrl: `/uploads/${req.file.filename}`, // Reference pointer to physical file
    uploadedBy: adminUserId,
    upvotes: 0,
  });
  ```
- MongoDB creates the index entries, timestamps the document, and confirms the save. The backend responds with HTTP 201 (`Created`), and the admin's upload progress bar finishes with a success checkmark.

#### Step 5: Students selecting their branch and opening/downloading the file
- A student arrives at the portal and selects **Computer Science (CSE)** and **Semester 4**.
- The React application queries the backend:
  ```http
  GET /api/resources?branch=CSE&semester=4
  ```
- MongoDB performs a fast, indexed query and returns the matching JSON resource documents in milliseconds.
- When the student interacts with the resource card, they have two options:
  1. **"Open / View" (`GET /api/resources/:id/view`):** The server sets `Content-Type: application/pdf` and `Content-Disposition: inline`. The student's browser opens the document directly in its built-in PDF viewer without leaving the page.
  2. **"Download" (`GET /api/resources/:id/download`):** The server sets `Content-Disposition: attachment; filename="Operating_Systems_PYQ_2024.pdf"`. The browser initiates a direct download onto the student's laptop or mobile device.

👉 **Need advanced migration code for AWS S3 or Cloudflare R2? See the accompanying [FILE_STORAGE_GUIDE.md](./FILE_STORAGE_GUIDE.md).**

---

## 💡 Need Help or Want to Contribute?
Feel free to open an issue or submit a pull request if you'd like to add new branch subjects, improve the UI, or expand question paper solutions! Happy learning! 🎓

---

## 👥 Project Credits & Team
- **Project Lead & Architecture**: **Anurag Dewangan**
- **Team Members**:
  - **Sudeeshna**
  - **Abhinav Kanwar**
  - **Dimple Stylee**
  - **Pavani Yadav**

