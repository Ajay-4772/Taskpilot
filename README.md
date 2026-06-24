# ✈️ TaskPilot

TaskPilot is a premium, full-stack, SaaS-style Task Management Application built using the MERN stack (MongoDB, Express.js, React, Node.js), Tailwind CSS v4, Framer Motion, and Firebase Authentication. It features a modern, responsive layout, real-time analytics, light/dark themes, and complete task filtering and tracking.

---

## 🚀 Key Features

*   **🔒 Secure Authentication**: Full authentication flows including **Google OAuth** popups and **Email/Password** logins powered by Firebase Authentication.
*   **🎨 Premium SaaS UI/UX**: Custom design system resembling Linear and Vercel. Built with **Tailwind CSS v4** (CSS-first variable themes), custom fonts, glassmorphism headers, `24px` border-radii, and neon radial glow backgrounds.
*   **🌓 Persisted Theme Switcher**: Toggle seamlessly between Light Theme (soft gray/clean white) and Dark Theme (navy space base). Selections are saved to `localStorage` to persist across page reloads.
*   **📊 Real-time Dashboard Analytics**: High-fidelity statistics cards showing count summaries for *Total*, *Pending*, *In Progress*, and *Completed* tasks.
*   **📝 Task Management Features**:
    *   Create, Read, Update, and Delete (CRUD) tasks.
    *   Color-coded **Priority Badges** (`Low`, `Medium`, `High`).
    *   **Due Dates** with warning indicators and red alerts for overdue items.
*   **🔍 Search & Pill Filters**: Real-time searching across titles/descriptions combined with status pills displaying dynamic task counts (e.g. `All (12)`).
*   **✨ Smooth Animations**: Fluid page loads, hover lifts (`translate-y-1`), scale hovers, and slide-up modal interfaces powered by **Framer Motion**.
*   **📱 Responsive Layout**: Built with CSS Grid and Flexbox, fully optimized for Mobile, Tablet, and Desktop screen widths.

---

## 🛠️ Technology Stack

### Frontend
*   **React.js** & **Vite** (Fast React compiler and hot reloading)
*   **Tailwind CSS v4** (CSS-first styling engine)
*   **Framer Motion** (Visual animations)
*   **Firebase SDK** (Google and Email Auth clients)
*   **Lucide React** (Modern, clean svg icons)
*   **SweetAlert2** (Premium notification modals)
*   **Axios** (API requests with automatic token headers interceptor)

### Backend
*   **Node.js** & **Express.js** (Server routes & MVC APIs)
*   **Firebase Admin SDK** (Token verification middleware)
*   **Mongoose** (Database object modeling)

### Database
*   **MongoDB Atlas** (Cloud-hosted NoSQL cluster)

---

## 📂 Project Structure

```text
mini-project-management/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB Atlas connection setup
│   │   └── firebase.js           # Firebase Admin SDK initializer
│   ├── controllers/
│   │   ├── authController.js     # JWT token verification handler
│   │   └── taskController.js     # User-isolated task CRUD logic
│   ├── middleware/
│   │   ├── authMiddleware.js     # Token verification route-guard
│   │   └── errorMiddleware.js    # Standardized API error handler
│   ├── models/
│   │   └── Task.js               # MongoDB Task schema
│   ├── routes/
│   │   └── taskRoutes.js         # Protected task endpoints
│   ├── .env                      # API secret configurations
│   ├── .env.example              # Template for server secrets
│   └── server.js                 # Express server entry point
│
└── frontend/
    ├── src/
    │   ├── auth/
    │   │   └── AuthContext.jsx   # Auth provider & state (Google/Email methods)
    │   ├── firebase/
    │   │   └── firebaseConfig.js # Client Firebase credentials loading
    │   ├── components/
    │   │   ├── Navbar.jsx        # Sticky floating glassmorphism header
    │   │   ├── ProtectedRoute.jsx# Page guard routing redirect
    │   │   ├── TaskCard.jsx      # Task details card
    │   │   └── TaskFormModal.jsx # Unified create/edit task modal overlay
    │   ├── pages/
    │   │   ├── Login.jsx         # Split landing page (Google/Email forms)
    │   │   └── Dashboard.jsx     # Stats, search inputs, filters, and cards
    │   ├── services/
    │   │   └── taskService.js    # Axios client with Bearer auth headers
    │   ├── index.css             # Theme variables & utility overrides
    │   ├── App.jsx               # Theme wrappers & route mounts
    │   └── main.jsx              # React mounting root
    ├── .env.example              # Client credentials template
    ├── firebase.json             # Hosting deployment config
    └── package.json
```

---

## ⚙️ Local Installation & Configuration

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB Atlas cluster account
*   Firebase console account

---

### Step 1: Clone the Repository
```bash
git clone <your-github-repo-url>
cd mini-project-management-portal
```

---

### Step 2: Configure the Backend Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder and supply the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/projectmanagement
   FIREBASE_PROJECT_ID=your-firebase-project-id
   
   # Retrieve this JSON from Firebase Console -> Project Settings -> Service Accounts
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account", "project_id":"your-project-id", ...}
   ```
4. Start the backend API server:
   ```bash
   npm start
   ```
   *Logs should print: `Server running on port 5000` and `MongoDB Connected`.*

---

### Step 3: Configure the Frontend client
1. Open a new terminal tab and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` folder and supply your Firebase web configuration credentials:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...your-actual-api-key...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=83726...
   VITE_FIREBASE_APP_ID=1:83726...
   
   # For local development, this defaults to localhost:5000. In production, point it to your hosted API url:
   VITE_API_URL=http://localhost:5000/tasks
   ```
4. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *Navigate to [http://localhost:5174/](http://localhost:5174/) to open the application.*

---

## ☁️ Deployment

### Deploys static React build to Firebase Hosting:
1. Make sure you are logged in to the Firebase CLI:
   ```bash
   firebase login
   ```
2. Navigate to the `frontend/` folder, build the production compilation (Vite will inject the `.env` keys into the build), and deploy:
   ```bash
   npm run build
   firebase deploy
   ```
3. The CLI will output your live Hosting URL (e.g. `https://your-project.web.app`).

### Deploy Backend:
You can host the node API backend on [Render](https://render.com/) or [Railway](https://railway.app/). Once hosted, update the `VITE_API_URL` variable in your `frontend/.env` to point to the live server URL, compile a new build with `npm run build`, and redeploy.

---

## 📜 MongoDB Task Schema
```json
{
  "title": "String (required)",
  "description": "String (required, minimum 20 characters)",
  "status": "String (Pending | In Progress | Completed)",
  "priority": "String (Low | Medium | High)",
  "dueDate": "Date (optional)",
  "createdAt": "Date (default: Date.now)",
  "userId": "String (required, maps user credentials ownership)"
}
```

---

## 📄 License
This project is open-source and available under the [ISC License](https://opensource.org/licenses/ISC).
