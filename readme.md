# RoomSync: Meeting Room Booker with Integrated Ordering System

**Version:** 1.0 (As of May 1, 2025)

## Description

An extension for a meeting room booking application that adds a full-featured coffee and snack ordering system, streamlining refreshments for meetings. This application allows users to seamlessly book rooms and order food/beverages using their Microsoft work accounts, with automated notifications ensuring timely delivery for meeting room orders.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints Summary](#api-endpoints-summary)
- [Configuration Details](#configuration-details)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

### User Features

- **Microsoft Authentication:** Secure login using Microsoft work/organizational accounts (via MS Graph API & Passport.js).
- **Room Booking:** (Core functionality - Assuming exists in base application).
- **Menu Browse:** View available food and beverage items with details, images, and pricing.
- **Item Customization:** Select options for applicable items (e.g., sweetness level for tea/coffee).
- **Shopping Cart:** Add items, update quantities, remove items, view total price. Persists using Redux state and localStorage.
- **Checkout:** Select delivery location (Canteen or specific Meeting Room) and place the order.
- **Order History:** View a list of previously placed orders with status and details.
- **Responsive UI:** Modern, responsive interface built with React and Material UI.
- **Theme Toggle:** Switch between Light and Dark modes.

### Admin Features

- **Menu Management API:** Backend endpoints for administrators to perform CRUD operations on menu items (name, price, description, image, category, customizable options).
- **Order Viewing API:** Backend endpoint for viewing all orders placed through the system.
- _(Frontend Admin UI for Menu Management & Order Viewing is pending implementation)_

### System & Notification Features

- **Automated Teams Notifications:** Instant alerts sent via Microsoft Teams Incoming Webhooks to designated personnel (e.g., guards) for orders requiring meeting room delivery.
- **Automated WhatsApp Notifications:** Detailed order information sent directly to the caterer's WhatsApp number via the Twilio API for meeting room orders.

## Tech Stack

- **Frontend:**
  - React (`vite` or `create-react-app`)
  - Redux Toolkit (for global state management - cart, shared state)
  - Material UI (MUI) (Component library, styling)
  - Formik (Form handling - planned for Admin UI)
  - Framer Motion (UI animations)
  - Axios (HTTP client)
  - React Router DOM (Routing)
- **Backend:**
  - Node.js
  - Express.js (Web framework)
  - Mongoose (MongoDB ODM)
  - Passport.js (Authentication middleware - `passport-microsoft` strategy)
  - `express-session` (Session management for auth)
  - `cors` (Cross-Origin Resource Sharing)
  - `dotenv` (Environment variable loading)
  - `axios` / `twilio` (For sending notifications)
- **Database:**
  - MongoDB Atlas (Cloud-hosted MongoDB, requires replica set for transactions)
- **Authentication:**
  - Microsoft Entra ID (formerly Azure AD) / Microsoft Identity Platform (using MS Graph API)
- **Notifications:**
  - Microsoft Teams (via Incoming Webhooks)
  - Twilio API (for WhatsApp Business Messaging)
- **Development:**
  - Docker (optional, for local MongoDB if not using Atlas initially)

## Prerequisites

Before you begin, ensure you have the following installed and configured:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- `npm` or `yarn` package manager
- [Git](https://git-scm.com/)
- **MongoDB Atlas Account:** A free or paid cluster ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas)). Ensure it's a replica set (default for Atlas).
- **Microsoft Azure/Entra ID Account:** An account with permissions to register an application to get Client ID, Client Secret, and configure Reply URLs for authentication.
- **Twilio Account:** Account SID, Auth Token, and a configured WhatsApp Sender (either the Sandbox or a purchased, WhatsApp-approved number). ([Twilio](https://www.twilio.com/))
- **Microsoft Teams:** A Team and Channel where notifications can be sent, with an Incoming Webhook URL configured for that channel.

## Getting Started

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder-name>
    ```
2.  **Install Backend Dependencies:**
    ```bash
    cd backend # Or your backend folder name
    npm install
    # or: yarn install
    ```
3.  **Install Frontend Dependencies:**
    ```bash
    cd ../frontend # Or your frontend folder name
    npm install
    # or: yarn install
    ```

### Environment Variables

This project uses environment variables for configuration.

1.  **Backend (`backend/.env`):**
    Create a `.env` file in the `backend` directory and add the following variables:

    ```dotenv
    # Server Configuration
    PORT=5000

    # MongoDB Atlas Connection String
    MONGO_ATLAS_URI="mongodb+srv://<username>:<password>@<cluster-url>/<database_name>?retryWrites=true&w=majority..."

    # Session Secret
    SESSION_SECRET="<your_strong_session_secret>"

    # Microsoft Authentication Credentials (from Azure/Entra ID App Registration)
    MICROSOFT_CLIENT_ID="<your_microsoft_app_client_id>"
    MICROSOFT_CLIENT_SECRET="<your_microsoft_app_client_secret_value>"
    # Callback URL configured in Azure/Entra ID (e.g., http://localhost:5000/auth/microsoft/callback)
    MICROSOFT_CALLBACK_URL="<your_backend_ms_callback_url>"

    # Frontend URL (for CORS and Redirects)
    CLIENT_APP_URL="http://localhost:5173" # Adjust port if your frontend runs elsewhere

    # Teams Notification Webhook URL
    TEAMS_WEBHOOK_URL="<your_teams_incoming_webhook_url>"

    # Twilio Credentials (for WhatsApp)
    WHATSAPP_PROVIDER="TWILIO" # Or other provider if implemented
    TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    TWILIO_AUTH_TOKEN="your_twilio_auth_token"
    TWILIO_WHATSAPP_FROM="whatsapp:+14155238886" # Twilio Sandbox or your approved number
    CATERER_WHATSAPP_NUMBER="<caterer_whatsapp_number_with_country_code>" # e.g., +91XXXXXXXXXX

    # Optional: JWT Secret if used for any other purpose
    # JWT_SECRET="<your_jwt_secret>"
    ```

2.  **Frontend (`frontend/.env`):**
    Create a `.env` file in the `frontend` directory (ensure your frontend framework, like Vite or CRA, supports this).

    ```dotenv
    # URL pointing to your backend server API
    VITE_API_BASE_URL="http://localhost:5000" # For Vite (use REACT_APP_ for CRA)
    ```

**Important:** Never commit your `.env` files to version control. Add `.env` to your `.gitignore` file.

## Running the Application

1.  **Start the Backend Server:**

    ```bash
    cd backend
    npm run dev # Or your script for running in development (e.g., using nodemon)
    # Or: npm start # For production start
    ```

    The backend should typically run on `http://localhost:5000`.

2.  **Start the Frontend Development Server:**

    ```bash
    cd frontend
    npm run dev # Or your script for starting the frontend (e.g., vite dev or react-scripts start)
    ```

    The frontend should typically run on `http://localhost:5173` (or port 3000 for CRA).

3.  Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`).

## API Endpoints Summary

(Optional: Add a brief list of main API routes and their purpose)

- **`GET /api/menu`**: Get active menu items for users.
- **`POST /api/orders`**: Place a new order.
- **`GET /api/orders/my-history`**: Get logged-in user's order history.
- **`GET /api/meeting-rooms`**: Get list of available meeting rooms.
- **`GET /auth/microsoft`**: Initiate Microsoft login flow.
- **`GET /auth/microsoft/callback`**: Microsoft callback URL.
- **`POST /auth/logout`**: Logout user.
- **Admin Routes (Require Admin privileges):**
  - `POST /api/menu`
  - `GET /api/menu/admin`
  - `PUT /api/menu/:id`
  - `DELETE /api/menu/:id`
  - `GET /api/orders/all`

## Configuration Details

- **MongoDB Atlas URI:** Obtain from your Atlas cluster's "Connect" -> "Drivers" section. Replace placeholders with your database user credentials.
- **Microsoft Credentials:** Register an application in your organization's Microsoft Entra ID (Azure Portal). Configure a "Web" platform, add the `MICROSOFT_CALLBACK_URL` as a Redirect URI, and generate a Client Secret. Note the Application (client) ID and the Secret Value. Grant necessary MS Graph API permissions (e.g., `User.Read`).
- **Twilio Credentials:** Find your Account SID and Auth Token in your Twilio Console dashboard. Configure a WhatsApp sender (Sandbox or purchased number) under Messaging -> Senders -> WhatsApp Senders.
- **Teams Webhook URL:** Generate from the target Teams channel -> Connectors -> Incoming Webhook configuration.

## Project Structure

(Optional: Provide a simplified view of key directories)
