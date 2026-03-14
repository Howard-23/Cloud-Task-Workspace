const fs = require('fs');
const path = require('path');

const files = {
    "api/health.js": `module.exports = (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date() });
};`,

    "api/auth/syncUser.js": `const withApiAuth = require('../../server/utils/withApiAuth');
const { upsertUser } = require('../../server/queries/users');

module.exports = withApiAuth(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { uid, email, name, picture } = req.user;
  try {
    const dbUser = await upsertUser(uid, email, name || email.split('@')[0], picture);
    res.status(200).json({ user: dbUser });
  } catch (error) {
    console.error('syncUser error', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});`,

    "api/projects/index.js": `const withApiAuth = require('../../server/utils/withApiAuth');
const { getProjects } = require('../../server/queries/projects');
const { getUserByUid } = require('../../server/queries/users');

module.exports = withApiAuth(async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const user = await getUserByUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const docs = await getProjects(user.id);
    res.status(200).json({ projects: docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`,

    "api/projects/create.js": `const withApiAuth = require('../../server/utils/withApiAuth');
const { createProject } = require('../../server/queries/projects');
const { getUserByUid } = require('../../server/queries/users');

module.exports = withApiAuth(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { title, description, status } = req.body;
    const user = await getUserByUid(req.user.uid);
    const proj = await createProject(user.id, title, description, status);
    res.status(201).json({ project: proj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`,

    "api/tasks/index.js": `const withApiAuth = require('../../server/utils/withApiAuth');
const { getTasks } = require('../../server/queries/tasks');

module.exports = withApiAuth(async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId required' });
    const docs = await getTasks(projectId);
    res.status(200).json({ tasks: docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`,

    "api/tasks/create.js": `const withApiAuth = require('../../server/utils/withApiAuth');
const { createTask } = require('../../server/queries/tasks');

module.exports = withApiAuth(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { projectId, assignedTo, title, description, priority, status, dueDate } = req.body;
    const doc = await createTask(projectId, assignedTo, title, description, priority, status, dueDate);
    res.status(201).json({ task: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`
};

for (const [filepath, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(__dirname, filepath), content);
}
console.log('API routes generated');
