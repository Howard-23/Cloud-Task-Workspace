const { query } = require('../config/db');

function normalizeAccess(currentUserOrId) {
  if (typeof currentUserOrId === 'string') {
    return { userId: currentUserOrId, workspaceRole: 'member' };
  }

  return {
    userId: currentUserOrId?.id,
    workspaceRole: currentUserOrId?.role || 'member',
  };
}

function getTaskSort(sort) {
  switch (sort) {
    case 'due_asc':
      return 't.due_date ASC NULLS LAST, t.updated_at DESC';
    case 'updated_desc':
      return 't.updated_at DESC';
    case 'priority_desc':
      return `
        CASE t.priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          ELSE 3
        END,
        t.updated_at DESC
      `;
    case 'status_default':
    default:
      return `
        CASE t.status
          WHEN 'in_progress' THEN 1
          WHEN 'todo' THEN 2
          ELSE 3
        END,
        t.due_date ASC NULLS LAST,
        t.updated_at DESC
      `;
  }
}

async function listTasksForUser(currentUserOrId, filters = {}, client) {
  const access = normalizeAccess(currentUserOrId);
  const userId = access.userId;
  const params = [userId];
  const conditions = [];

  if (!['owner', 'admin'].includes(access.workspaceRole)) {
    conditions.push(`
      (
        p.owner_id = $1
        OR EXISTS (
          SELECT 1
          FROM project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = $1
        )
      )
    `);
  }

  conditions.push('p.deleted_at IS NULL');
  conditions.push('t.deleted_at IS NULL');

  if (filters.projectId) {
    params.push(filters.projectId);
    conditions.push(`t.project_id = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`t.status = $${params.length}`);
  }

  if (filters.priority) {
    params.push(filters.priority);
    conditions.push(`t.priority = $${params.length}`);
  }

  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(`(t.title ILIKE $${params.length} OR t.description ILIKE $${params.length})`);
  }

  const limit = Number(filters.limit) || 12;
  const page = Number(filters.page) || 1;
  const offset = (page - 1) * limit;
  const whereClause = conditions.length ? conditions.join(' AND ') : 'TRUE';
  const sortClause = getTaskSort(filters.sort);

  const countResult = await query(
    `
      SELECT COUNT(*)::int AS total
      FROM tasks t
      JOIN projects p ON p.id = t.project_id AND p.deleted_at IS NULL
      WHERE ${whereClause}
    `,
    params,
    client,
  );

  const total = countResult.rows[0]?.total || 0;
  const dataParams = [...params, limit, offset];

  const result = await query(
    `
      SELECT
        t.id,
        t.project_id AS "projectId",
        t.assigned_to AS "assignedTo",
        t.title,
        t.description,
        t.priority,
        t.status,
        t.due_date AS "dueDate",
        t.created_at AS "createdAt",
        t.updated_at AS "updatedAt",
        p.title AS "projectTitle",
        assignee.name AS "assigneeName"
      FROM tasks t
      JOIN projects p ON p.id = t.project_id AND p.deleted_at IS NULL
      LEFT JOIN project_members pm_current ON pm_current.project_id = p.id AND pm_current.user_id = $1
      LEFT JOIN users assignee ON assignee.id = t.assigned_to
      WHERE ${whereClause}
      ORDER BY ${sortClause}
      LIMIT $${dataParams.length - 1}
      OFFSET $${dataParams.length}
    `,
    dataParams,
    client,
  );

  return {
    rows: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

async function getTaskForUser(taskId, currentUserOrId, client) {
  const access = normalizeAccess(currentUserOrId);
  const userId = access.userId;
  const accessCondition = ['owner', 'admin'].includes(access.workspaceRole)
    ? 'p.deleted_at IS NULL AND t.deleted_at IS NULL'
    : `
        (
          p.owner_id = $2
          OR EXISTS (
            SELECT 1
            FROM project_members pm
            WHERE pm.project_id = p.id AND pm.user_id = $2
          )
        )
        AND p.deleted_at IS NULL
        AND t.deleted_at IS NULL
      `;
  const result = await query(
    `
      SELECT
        t.id,
        t.project_id AS "projectId",
        t.assigned_to AS "assignedTo",
        t.title,
        t.description,
        t.priority,
        t.status,
        t.due_date AS "dueDate",
        t.created_at AS "createdAt",
        t.updated_at AS "updatedAt",
        p.title AS "projectTitle",
        assignee.name AS "assigneeName"
      FROM tasks t
      JOIN projects p ON p.id = t.project_id AND p.deleted_at IS NULL
      LEFT JOIN project_members pm_current ON pm_current.project_id = p.id AND pm_current.user_id = $2
      LEFT JOIN users assignee ON assignee.id = t.assigned_to
      WHERE
        t.id = $1
        AND ${accessCondition}
      LIMIT 1
    `,
    [taskId, userId],
    client,
  );

  return result.rows[0] || null;
}

async function insertTask(payload, client) {
  const result = await query(
    `
      INSERT INTO tasks (
        project_id,
        assigned_to,
        title,
        description,
        priority,
        status,
        due_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        project_id AS "projectId",
        assigned_to AS "assignedTo",
        title,
        description,
        priority,
        status,
        due_date AS "dueDate",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      payload.projectId,
      payload.assignedTo || null,
      payload.title,
      payload.description || '',
      payload.priority || 'medium',
      payload.status || 'todo',
      payload.dueDate || null,
    ],
    client,
  );

  return result.rows[0];
}

async function updateTask(taskId, payload, client) {
  const result = await query(
    `
      UPDATE tasks
      SET
        project_id = COALESCE($2, project_id),
        assigned_to = $3,
        title = COALESCE($4, title),
        description = COALESCE($5, description),
        priority = COALESCE($6, priority),
        status = COALESCE($7, status),
        due_date = $8,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        project_id AS "projectId",
        assigned_to AS "assignedTo",
        title,
        description,
        priority,
        status,
        due_date AS "dueDate",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      taskId,
      payload.projectId || null,
      payload.assignedTo ?? null,
      payload.title || null,
      payload.description || null,
      payload.priority || null,
      payload.status || null,
      payload.dueDate || null,
    ],
    client,
  );

  return result.rows[0] || null;
}

async function deleteTask(taskId, client) {
  const result = await query(
    `
      UPDATE tasks
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING id, title
    `,
    [taskId],
    client,
  );
  return result.rows[0] || null;
}

module.exports = {
  listTasksForUser,
  getTaskForUser,
  insertTask,
  updateTask,
  deleteTask,
};
