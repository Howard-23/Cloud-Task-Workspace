const fs = require('fs');
const path = require('path');

const uiFiles = [
    "Button", "Input", "Textarea", "Select", "Modal", "Drawer", "Badge", "Card",
    "Table", "Tabs", "Spinner", "Toast", "Avatar", "EmptyState", "ErrorState", "Skeleton"
];
const commonFiles = ["PageHeader", "ConfirmDialog", "SearchBar", "StatusPill"];
const layoutFiles = ["Navbar"];
const pages = [
    "public/Features", "auth/ForgotPassword",
    "projects/ProjectDetails", "projects/CreateProject", "projects/EditProject",
    "tasks/TaskBoard", "tasks/CreateTask", "tasks/EditTask",
    "team/TeamPage", "team/InviteMember",
    "settings/SettingsPage", "settings/ProfilePage"
];
const hooks = ["useProjects", "useTasks", "useTeam", "useToast"];
const services = ["projectService", "taskService", "teamService", "userService"];
const utils = ["formatDate", "formatStatus", "storage", "validators"];
const serverControllers = ["authController", "projectController", "taskController", "teamController", "userController"];
const apiFiles = [
    "projects/update", "projects/delete", "projects/[id]",
    "tasks/update", "tasks/delete", "tasks/[id]",
    "team/index", "team/invite", "team/remove",
    "users/profile", "users/update"
];

const writeComponent = (folder, Name) => {
    const filePath = path.join(__dirname, 'client', 'src', folder, \`\${Name}.jsx\`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, \`import React from 'react';\\n\\nexport default function \${Name.split('/').pop()}() {\\n  return <div>\${Name.split('/').pop()}</div>;\\n}\\n\`);
  }
};

const writeJS = (base, folder, Name) => {
  const filePath = path.join(__dirname, base, folder, \`\${Name}.js\`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, \`// TODO: Implement \${Name}\\nmodule.exports = {};\\n\`);
  }
};

const writeClientJS = (folder, Name) => {
  const filePath = path.join(__dirname, 'client', 'src', folder, \`\${Name}.js\`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, \`// TODO: Implement \${Name}\\nexport {};\\n\`);
  }
};

uiFiles.forEach(name => writeComponent('components/ui', name));
commonFiles.forEach(name => writeComponent('components/common', name));
layoutFiles.forEach(name => writeComponent('components/layout', name));
pages.forEach(name => writeComponent('pages', name));

hooks.forEach(name => writeClientJS('hooks', name));
services.forEach(name => writeClientJS('services', name));
utils.forEach(name => writeClientJS('utils', name));

serverControllers.forEach(name => writeJS('server', 'controllers', name));
['validators', 'errors', 'slugify'].forEach(name => writeJS('server', 'utils', name));
['authService', 'projectService', 'taskService', 'teamService', 'userService'].forEach(name => writeJS('server', 'services', name));
['team', 'activityLogs'].forEach(name => writeJS('server', 'queries', name));
['validate'].forEach(name => writeJS('server', 'middleware', name));
['permissions'].forEach(name => writeJS('shared', 'helpers', name));
apiFiles.forEach(name => writeJS('api', '', name));

console.log('Missing stub files created successfully.');
