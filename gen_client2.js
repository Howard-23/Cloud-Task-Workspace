const fs = require('fs');
const path = require('path');

const files = {
    "client/src/services/auth.js": `import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const registerUser = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logoutUser = () => signOut(auth);`,

    "client/src/services/api.js": `import axios from 'axios';
import { auth } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

export default api;`,

    "client/src/components/layout/ProtectedRoute.jsx": `import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth();
  if (loading) return <div>Loading account...</div>;
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
}`,

    "client/src/components/layout/DashboardLayout.jsx": `import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}`,

    "client/src/components/layout/Sidebar.jsx": `import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">CloudTask Pro</div>
      <nav className="sidebar-nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/tasks">Tasks</Link>
        <Link to="/team">Team</Link>
        <Link to="/settings">Settings</Link>
      </nav>
    </aside>
  );
}`,

    "client/src/components/layout/Topbar.jsx": `import React from 'react';
import { logoutUser } from '../../services/auth';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <h2>Welcome Back</h2>
      <div className="topbar-actions">
        <button onClick={handleLogout} className="btn btn-outline">Logout</button>
      </div>
    </header>
  );
}`
};

for (const [filepath, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(__dirname, filepath), content);
}
console.log('Client auth and layouts generated');
