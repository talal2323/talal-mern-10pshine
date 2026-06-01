# 10P Shine Notes App 📝

A full-stack MERN (MongoDB, Express, React, Node.js) application featuring real-time updates and an enterprise-grade CI/CD pipeline for automated code quality and security analysis.

## 🚀 Overview

This project is a scalable, real-time notes application. Beyond standard CRUD operations, it prioritizes clean architecture, robust security, and automated deployment pipelines. It integrates **Socket.IO** for live UI updates and enforces strict code quality gates using **GitHub Actions** and **SonarCloud**.

## 🛠 Tech Stack

*   **Frontend:** React, Tailwind CSS, Socket.IO-client
*   **Backend:** Node.js, Express.js, Socket.IO
*   **Database:** MongoDB & Mongoose
*   **CI/CD & DevOps:** GitHub Actions, SonarCloud

---

## 🛡️ Security & Code Quality (CI/CD)

This repository is equipped with a fully automated Continuous Integration pipeline. Every pull request and merge into the `develop` branch triggers a comprehensive SonarCloud analysis.

### Highlights
*   **Zero-Trust Database Queries:** Protected against NoSQL Injection attacks. All user-controlled data (`req.body`, `req.query`) is strictly cast to `String` types before executing Mongoose queries (e.g., bypassing `$gt` operator exploits).
*   **A-Grade Maintainability:** Codebase is actively refactored to eliminate code smells, enforce modern JavaScript standards (`globalThis`, optional chaining `?.`), and maintain low cognitive complexity by avoiding deep function nesting.
*   **Accessibility Compliant:** Strict adherence to semantic HTML and React accessibility standards (e.g., properly associated form labels and inputs).

### SonarCloud Configuration Notes
For developers maintaining the CI/CD pipeline:
*   **Pipeline Method:** "Automatic Analysis" is strictly **disabled** in SonarCloud. All scans are triggered exclusively via the `.github/workflows/sonarcloud.yml` GitHub Action to ensure environments match.
*   **Branching Strategy:** The `develop` branch is designated as the primary baseline (`MAIN BRANCH` in SonarCloud) to track overall code health.
*   **Visibility:** The project leverages SonarCloud's open-source tier.

---

## 💻 Local Development Setup

### Prerequisites
*   Node.js (v16+)
*   MongoDB Instance (Local or Atlas)

### Installation

1. **Clone the repository:**
```bash
   git clone https://github.com/talal2323/talal-mern-10pshine.git
   cd talal-mern-10pshine
   ```

2. **Install Backend Dependencies:**
```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
```bash
   cd ../frontend
   npm install
   ```

4. **Environment Variables:**
Create a `.env` file in the `backend/` directory with the following:
```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

### Running the Application

Open two terminal windows to run both servers concurrently:

**Terminal 1 (Backend):**
```bash
   cd backend
   npm run dev
   ```

**Terminal 2 (Frontend):**
```bash
   cd frontend
   npm start
   ```

## 🌿 Git Branching Workflow
This project separates frontend and backend feature development before merging into the main testing branch:
*   `frontend` - UI components, React state, and Socket client logic.
*   `backend` - Express controllers, Mongoose models, and authentication middleware.
*   `develop` - Integration testing and automated SonarCloud Quality Gates.

---
*Developed for the 10Pearls SHINE Program.*
