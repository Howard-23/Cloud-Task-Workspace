const fs = require('fs');
const path = require('path');

const dirs = [
  "client/public",
  "client/src/assets",
  "client/src/components/ui",
  "client/src/components/layout",
  "client/src/components/common",
  "client/src/pages/public",
  "client/src/pages/auth",
  "client/src/pages/dashboard",
  "client/src/pages/projects",
  "client/src/pages/tasks",
  "client/src/pages/team",
  "client/src/pages/settings",
  "client/src/routes",
  "client/src/hooks",
  "client/src/context",
  "client/src/services",
  "client/src/utils",
  "client/src/styles",
  "api/auth",
  "api/projects",
  "api/tasks",
  "api/team",
  "api/users",
  "server/config",
  "server/middleware",
  "server/controllers",
  "server/services",
  "server/models",
  "server/queries",
  "server/utils",
  "shared/constants",
  "shared/helpers"
];

for (const dir of dirs) {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
}
