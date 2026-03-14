const fs = require('fs');
const path = require('path');

const files = {
    "client/src/styles/variables.css": `
:root[data-theme="light"] {
  --bg-color: #f9fbfc;
  --bg-card: #ffffff;
  --bg-sidebar: #1e1e2d;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --border-color: #e5e7eb;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --radius-md: 12px;
  --radius-lg: 16px;
}
:root[data-theme="dark"] {
  --bg-color: #0d1117;
  --bg-card: #161b22;
  --bg-sidebar: #010409;
  --text-primary: #f0f6fc;
  --text-secondary: #8b949e;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --border-color: #30363d;
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
  --radius-md: 12px;
  --radius-lg: 16px;
}
* { box-sizing: border-box; }
`,

    "client/src/styles/reset.css": `
html, body, div, span, h1, h2, h3, p, a, form, label {
  margin: 0; padding: 0; border: 0; font-size: 100%;
  font: inherit; vertical-align: baseline;
}
`,

    "client/src/styles/globals.css": `
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
a { color: var(--primary-color); text-decoration: none; }
a:hover { text-decoration: underline; }
`,

    "client/src/styles/layout.css": `
.dashboard-layout { display: flex; height: 100vh; overflow: hidden; }
.sidebar { width: 260px; background: var(--bg-sidebar); color: #fff; padding: 24px 0; display: flex; flex-direction: column; }
.sidebar-brand { font-size: 1.5rem; font-weight: 700; padding: 0 24px; margin-bottom: 32px; }
.sidebar-nav { display: flex; flex-direction: column; }
.sidebar-nav a { padding: 12px 24px; color: #9ca3af; text-decoration: none; font-weight: 500; }
.sidebar-nav a:hover { background: rgba(255,255,255,0.1); color: #fff; }

.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.topbar { height: 70px; background: var(--bg-card); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; flex-shrink: 0; }
.content-area { flex: 1; padding: 32px; overflow-y: auto; }
.page-container { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
`,

    "client/src/styles/utilities.css": `
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 32px; }
.big-number { font-size: 2.5rem; font-weight: 700; color: var(--primary-color); margin-top: 12px; }
.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
.full-width { width: 100%; }
.auth-card { max-width: 400px; margin: 100px auto; padding: 40px; background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); }
.error { color: #ef4444; background: #fee2e2; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
`,

    "client/src/styles/buttons.css": `
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; border: none; font-size: 0.95rem;
  background: var(--primary-color); color: #fff;
}
.btn:hover { background: var(--primary-hover); transform: translateY(-1px); }
.btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); }
.btn-outline:hover { background: var(--border-color); color: var(--text-primary); }
`,

    "client/src/styles/forms.css": `
.form-group { margin-bottom: 20px; text-align: left; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 0.9rem; color: var(--text-secondary); }
input[type="email"], input[type="password"], input[type="text"], textarea, select {
  width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;
  background: var(--bg-card); color: var(--text-primary); outline: none; transition: border-color 0.2s;
}
input:focus, textarea:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
`,

    "client/src/styles/cards.css": `
.card { background: var(--bg-card); border-radius: var(--radius-md); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); transition: box-shadow 0.2s; }
.card:hover { box-shadow: var(--shadow-md); }
.badge { display: inline-block; padding: 4px 10px; border-radius: 99px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; background: #e0f2fe; color: #0284c7; margin-top: 16px; }
`,

    "client/src/styles/tables.css": `
.table-container { background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-color); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 16px 24px; text-align: left; border-bottom: 1px solid var(--border-color); }
th { background: #f9fafb; font-weight: 600; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; tracking: 0.05em; }
`,

    "client/src/styles/dashboard.css": `
/* Combined up there */
`
};

for (const [filepath, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(__dirname, filepath), content);
}
console.log('CSS generated');
