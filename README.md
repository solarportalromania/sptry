# SolarPortal - Production-Ready Web Application

Welcome to SolarPortal! This is a full-stack web application designed to connect homeowners with solar panel installers. It features a React frontend, a Node.js/Express backend, a Neon serverless Postgres database, and Resend for transactional emails.

This guide provides all the necessary steps to set up the required services and deploy the application live on the web.

## ✨ Architecture

The application is now structured as a modern, decoupled client-server application:

-   **Frontend**: A React single-page application that serves as the user interface. Hosted as a **Static Site** on Render.
-   **Backend**: A Node.js/Express server that acts as a secure API gateway. It handles all business logic, database interactions, and communication with external services (Gemini, Resend). Hosted as a **Web Service** on Render.
-   **Database**: A serverless Postgres database from **Neon** for all persistent data (users, projects, etc.).
-   **Email Service**: **Resend** is used to send transactional emails for account verification and password resets.
-   **AI Service**: The **Google Gemini API** is called securely from the backend to provide AI-powered features.

---

## 🚀 Setup and Deployment Guide

Follow these three parts carefully to get the application running.

### Part 1: External Services Setup (The Foundation)

Before deploying, you need to create accounts and get credentials from Neon and Resend.

#### 1. Neon Database Setup

1.  Go to [neon.tech](https://neon.tech/) and create a free account.
2.  Create a new project.
3.  On your project dashboard, find the **Connection Details** widget.
4.  Copy the **Connection String** that starts with `postgresql://`. This is your `DATABASE_URL`.
5.  **CRITICAL STEP**: Go to the **SQL Editor** in your Neon project. Open the `database.sql` file from our project, copy its entire content, paste it into the Neon SQL Editor, and click **Run**. This will create all the tables your application needs.

#### 2. Resend Email Setup

1.  Go to [resend.com](https://resend.com) and create a free account.
2.  You must have a domain name you own to send emails. Follow their guide to **Add and Verify Your Domain**.
3.  Once your domain is verified, go to the **API Keys** section and create a new API key. This is your `RESEND_API_KEY`.

#### 3. Google Gemini API Key

1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create an API key. This is your `GEMINI_API_KEY`.

---

### Part 2: Backend Deployment (Render Web Service)

1.  **Push your code to GitHub**. Make sure all your project code is in a single GitHub repository.
2.  **Create Render Web Service**:
    *   On the Render Dashboard, click **New +** and select **Web Service**.
    *   Connect your GitHub account and select your project's repository.
3.  **Configure Settings**:
    *   **Name**: Give it a unique name (e.g., `solar-portal-backend`).
    *   **Root Directory**: Leave blank.
    *   **Runtime**: `Node`.
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
4.  **Add Environment Variables**:
    *   Go to the **Environment** tab.
    *   Click **Add Secret File**.
    *   **Filename**: `.env`
    *   **Contents**: Copy the content from the `.env.example` file in this project, and fill in your actual secret keys that you collected in Part 1.
5.  **Deploy**:
    *   Click **Create Web Service**.
    *   Render will build and deploy your backend. Once it's live, **copy its `.onrender.com` URL**. You'll need it for the frontend.

---

### Part 3: Frontend Deployment (Render Static Site)

1.  **Create Render Static Site**:
    *   On the Render Dashboard, click **New +** and select **Static Site**.
    *   Connect the same GitHub repository.
2.  **Configure Settings**:
    *   **Name**: Give it a unique name (e.g., `solar-portal-frontend`).
    *   **Publish Directory**: `./`
    *   **Build Command**: `echo "window.process = { env: { REACT_APP_API_URL: '$REACT_APP_API_URL' } }" > env.js`
3.  **Add Environment Variable**:
    *   Go to the **Environment** tab for this new Static Site.
    *   Click **Add Environment Variable**.
    *   **Key**: `REACT_APP_API_URL`
    *   **Value**: Paste the URL of your **backend service** that you copied in the previous step.
4.  **Deploy**: Click **Create Static Site**.

**Congratulations!** Your full-stack application is now live.

---

## 🧪 Test Credentials

These credentials will be available after you run the `database.sql` script.

-   **Admin:** `info@solarportal.ro` / `adminpassword`
-   **Homeowner:** `testuser1@example.com` / `password123`
-   **Installer:** `contact@testinstaller1.com` / `password123`
