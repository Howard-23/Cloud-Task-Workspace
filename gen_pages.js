const fs = require('fs');
const path = require('path');

const files = {
    "client/src/pages/public/Home.jsx": `import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home-container">
      <header className="hero">
        <h1>CloudTask Pro</h1>
        <p>Premium task management for modern teams.</p>
        <div className="hero-actions">
          <Link to="/login" className="btn">Login</Link>
          <Link to="/register" className="btn btn-outline">Register</Link>
        </div>
      </header>
    </div>
  );
}`,

    "client/src/pages/auth/Login.jsx": `import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/auth';
import api from '../../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      await api.post('/auth/syncUser');
      navigate('/dashboard');
    } catch (error) {
      setErr('Failed to login: ' + error.message);
    }
  };

  return (
    <div className="auth-card">
      <h2>Welcome Back</h2>
      {err && <div className="error">{err}</div>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn full-width">Sign In</button>
      </form>
      <div className="auth-footer">
        Need an account? <Link to="/register">Register</Link>
      </div>
    </div>
  );
}`,

    "client/src/pages/auth/Register.jsx": `import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/auth';
import api from '../../services/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser(email, password);
      await api.post('/auth/syncUser');
      navigate('/dashboard');
    } catch (error) {
      setErr('Failed to register: ' + error.message);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create Account</h2>
      {err && <div className="error">{err}</div>}
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn full-width">Sign Up</button>
      </form>
      <div className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}`,

    "client/src/pages/dashboard/DashboardHome.jsx": `import React from 'react';

export default function DashboardHome() {
  return (
    <div className="dashboard-home">
      <h1>Dashboard</h1>
      <div className="metrics-grid">
        <div className="card">
          <h3>Total Projects</h3>
          <p className="big-number">3</p>
        </div>
        <div className="card">
          <h3>Total Tasks</h3>
          <p className="big-number">12</p>
        </div>
        <div className="card">
          <h3>Completed</h3>
          <p className="big-number">5</p>
        </div>
      </div>
    </div>
  );
}`,

    "client/src/pages/projects/ProjectsList.jsx": `import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects').then(res => {
      setProjects(res.data.projects);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Projects</h1>
        <button className="btn">New Project</button>
      </div>
      <div className="projects-grid">
        {projects.map(p => (
          <div key={p.id} className="card project-card">
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <span className="badge">{p.status}</span>
          </div>
        ))}
        {projects.length === 0 && <p>No projects found. Create one!</p>}
      </div>
    </div>
  );
}`,

    "client/src/pages/tasks/TasksList.jsx": `import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function TasksList() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>All Tasks</h1>
        <button className="btn">New Task</button>
      </div>
      <div className="card">
        <p>No tasks selected. Check a project to view tasks.</p>
      </div>
    </div>
  );
}`
};

for (const [filepath, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(__dirname, filepath), content);
}
console.log('Pages generated');
