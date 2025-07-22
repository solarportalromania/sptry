# SolarPortal - Frontend Prototype

Welcome to SolarPortal! This is a feature-rich, frontend-only prototype of a web platform designed to connect homeowners with solar panel installers. Homeowners can submit their project details, and verified installers can provide competitive quotes.

This project is built as a single-page React application without a build step, using ES Modules and an import map for dependency management. All data is mocked and stored in-memory.

## ✨ Features

- **Dual User Roles:** Separate registration, login, and dashboard experiences for **Homeowners** and **Installers**.
- **Admin Dashboard:** A comprehensive backend panel for managing users, projects, blog content, finances, and platform settings.
- **Project Lifecycle:**
  - Homeowners create an account and submit their first project in one seamless flow.
  - Admins approve new projects.
  - Installers see new leads in their service area and can submit detailed quotes.
  - Homeowners receive, compare, and accept quotes.
  - Homeowners can share contact details with specific installers.
  - A deal-signing flow that generates financial records for commission tracking.
- **Dynamic Content:** A bilingual (English/Romanian) blog managed by admins.
- **Interactive Components:** Modals, notifications, chat, history logs, and data reporting.
- **Role-Based Access Control:** Users only see what's relevant to their role. Admins have configurable permissions.
- **Impersonation:** Admins can log in as any user for support and testing.

## 🚀 Getting Started (Running Locally)

This project runs directly in the browser without any build process.

### Prerequisites

You need a simple local web server to serve the files. The most common one is `http-server`, which requires Node.js and npm.

1. **Install Node.js:** If you don't have it, download it from [nodejs.org](https://nodejs.org/).
2. **Install http-server:** Open your terminal and run:
   ```bash
   npm install -g http-server
   ```

### Running the App

1. **Clone or download** the project files into a folder on your computer.
2. **Navigate to the project folder** in your terminal:
   ```bash
   cd path/to/solar-portal
   ```
3. **Start the server:**
   ```bash
   http-server
   ```
4. **Open your browser** and go to the URL provided by `http-server` (usually `http://127.0.0.1:8080`).

You should now see the SolarPortal landing page!

---

## 🏗️ Project Structure

The project is organized to separate concerns, making it easy to navigate.

```
/
├── components/         # All reusable React components
│   ├── AdminDashboard.tsx
│   ├── ClientDashboard.tsx
│   ├── InstallerDashboard.tsx
│   ├── LandingPage.tsx
│   └── ... (many other components)
├── data/               # Mock data source
│   └── mock.ts         # Contains all initial data for users, projects, etc.
├── App.tsx             # The main application component. Core logic lives here.
├── constants.ts        # Shared constant values (e.g., list of counties).
├── index.html          # The single HTML entry point. Contains TailwindCSS setup and the import map.
├── index.tsx           # Mounts the React application to the DOM.
├── LoginPage.tsx       # Component for the login page.
├── RegistrationPage.tsx  # Component for the initial registration choice.
├── ... (other page components)
├── translations.ts     # Contains all English and Romanian text strings.
└── types.ts            # Centralized TypeScript type and enum definitions.
```

### Key Files Explained

-   **`index.html`**: The app's entry point. It loads Tailwind CSS from a CDN and defines the ES Module `importmap` which allows the browser to import libraries like React directly without a build step.
-   **`App.tsx`**: **This is the most important file.** It acts as the central controller for the entire application. It holds all the application state, defines all the core logic functions (e.g., `handleLogin`, `handleProjectSubmit`), and manages the state-based routing.
-   **`data/mock.ts`**: This file is the "database" for the prototype. All users, projects, quotes, and other data are initialized here.
-   **`types.ts`**: Defines the data structures for the entire application, providing type safety.
-   **`components/`**: This directory contains all the UI components. The components are designed to be "dumb" where possible, receiving data and callbacks as props from `App.tsx`.
-   **`translations.ts`**: Handles internationalization (i18n). The `useLanguage` hook provides a `t()` function to retrieve text in the currently selected language.

---

## 🏛️ Architectural Concepts

-   **State Management**: All state is managed within the `App.tsx` component using `React.useState`. This centralized state is then passed down to child components via props. This is a simple and effective approach for a prototype of this scale.
-   **Routing**: The application uses a custom, state-based router. The `viewState` object in `App.tsx` determines which page or component is currently visible. Functions like `handleNavigate` or `handleViewQuoteDetails` simply update this state object to "change the page".
-   **Data Flow**: Since there is no backend, all data operations are functions within `App.tsx` that directly manipulate the state arrays (e.g., `projects`, `users`). For example, `handleQuoteSubmit` finds the relevant project in the `projects` state array and adds a new quote to it.

## 🧪 Test Credentials

Use these credentials on the Login page to test the different user roles.

-   **Admin:**
    -   **Email:** `admin@solarportal.com`
    -   **Password:** `adminpassword`
-   **Homeowner:**
    -   **Email:** `testuser1@example.com`
    -   **Password:** `password123`
-   **Installer:**
    -   **Email:** `contact@testinstaller1.com`
    -   **Password:** `password123`
