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

function getProjectSort(sort) {
  switch (sort) {
    case 'due_asc':
      return 'p.due_date ASC NULLS LAST, p.updated_at DESC';
    case 'progress_desc':
      return '"progressPercentage" DESC, p.updated_at DESC';
    case 'title_asc':
      return 'p.title ASC';
    case 'updated_desc':
    default:
      return 'p.updated_at DESC';
  }
}

async function listProjectsForUser(currentUserOrId, filters = {}, client) {
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

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`p.status = $${params.length}`);
  }

  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
  }

  if (typeof filters.archived === 'boolean') {
    params.push(filters.archived);
    conditions.push(`p.archived = $${params.length}`);
  }

  const limit = Number(filters.limit) || 12;
  const page = Number(filters.page) || 1;
  const offset = (page - 1) * limit;
  const whereClause = conditions.length ? conditions.join(' AND ') : 'TRUE';
  const sortClause = getProjectSort(filters.sort);

  const countResult = await query(
    `
      SELECT COUNT(DISTINCT p.id)::int AS total
      FROM projects p
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
        p.id,
        p.owner_id AS "ownerId",
        p.title,
        p.description,
        p.status,
        p.start_date AS "startDate",
        p.due_date AS "dueDate",
        p.priority,
        p.archived,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        COUNT(DISTINCT t.id)::int AS "taskCount",
        COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END)::int AS "completedTaskCount",
        COALESCE(
          ROUND(
            COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END)::numeric
            / NULLIF(COUNT(DISTINCT t.id), 0) * 100
          ),
          0
        )::int AS "progressPercentage",
        pm_current.role AS "memberRole"
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id AND t.deleted_at IS NULL
      LEFT JOIN project_members pm_current ON pm_current.project_id = p.id AND pm_current.user_id = $1
      WHERE ${whereClause}
      GROUP BY p.id, pm_current.role
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

async function getProjectForUser(projectId, currentUserOrId, client) {
  const access = normalizeAccess(currentUserOrId);
  const userId = access.userId;
  const accessCondition = ['owner', 'admin'].includes(access.workspaceRole)
    ? 'p.deleted_at IS NULL'
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
      `;
  const result = await query(
    `
      SELECT
        p.id,
        p.owner_id AS "ownerId",
        p.title,
        p.description,
        p.status,
        p.start_date AS "startDate",
        p.due_date AS "dueDate",
        p.priority,
        p.archived,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        COUNT(DISTINCT t.id)::int AS "taskCount",
        COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END)::int AS "completedTaskCount",
        COALESCE(
          ROUND(
            COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END)::numeric
            / NULLIF(COUNT(DISTINCT t.id), 0) * 100
          ),
          0
        )::int AS "progressPercentage",
        pm_current.role AS "memberRole"
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id AND t.deleted_at IS NULL
      LEFT JOIN project_members pm_current ON pm_current.project_id = p.id AND pm_current.user_id = $2
      WHERE
        p.id = $1
        AND ${accessCondition}
      GROUP BY p.id, pm_current.role
      LIMIT 1
    `,
    [projectId, userId],
    client,
  );

  return result.rows[0] || null;
}

async function insertProject(ownerId, payload, client) {
  const result = await query(
    `
      INSERT INTO projects (owner_id, title, description, status, start_date, due_date, priority, archived)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        owner_id AS "ownerId",
        title,
        description,
        status,
        start_date AS "startDate",
        due_date AS "dueDate",
        priority,
        archived,
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        0::int AS "taskCount",
        0::int AS "completedTaskCount",
        0::int AS "progressPercentage",
        'owner'::text AS "memberRole"
    `,
    [
      ownerId,
      payload.title,
      payload.description || '',
      payload.status || 'active',
      payload.startDate || null,
      payload.dueDate,
      payload.priority || 'medium',
      payload.archived ?? false,
    ],
    client,
  );

  return result.rows[0];
}

async function updateProject(projectId, ownerId, payload, client) {
  const result = await query(
    `
      UPDATE projects
      SET
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        start_date = $5,
        due_date = $6,
        priority = COALESCE($7, priority),
        archived = COALESCE($8, archived),
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        owner_id AS "ownerId",
        title,
        description,
        status,
        start_date AS "startDate",
        due_date AS "dueDate",
        priority,
        archived,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      projectId,
      payload.title || null,
      payload.description || null,
      payload.status || null,
      payload.startDate || null,
      payload.dueDate || null,
      payload.priority || null,
      payload.archived ?? null,
    ],
    client,
  );

  return result.rows[0] || null;
}

async function deleteProject(projectId, ownerId, client) {
  const result = await query(
    `
      UPDATE projects
      SET archived = TRUE, deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        title,
        archived,
        deleted_at AS "deletedAt"
    `,
    [projectId],
    client,
  );

  return result.rows[0] || null;
}

async function getProjectMembership(projectId, userId, client) {
  const result = await query(
    `
      SELECT
        id,
        project_id AS "projectId",
        user_id AS "userId",
        role,
        created_at AS "createdAt"
      FROM project_members
      WHERE project_id = $1 AND user_id = $2
      LIMIT 1
    `,
    [projectId, userId],
    client,
  );

  return result.rows[0] || null;
}

async function upsertProjectMember(projectId, userId, role = 'member', client) {
  const result = await query(
    `
      INSERT INTO project_members (project_id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (project_id, user_id)
      DO UPDATE SET role = EXCLUDED.role
      RETURNING
        id,
        project_id AS "projectId",
        user_id AS "userId",
        role,
        created_at AS "createdAt"
    `,
    [projectId, userId, role],
    client,
  );

  return result.rows[0];
}

async function replaceProjectMembers(projectId, ownerId, memberAssignments = [], client) {
  await query('DELETE FROM project_members WHERE project_id = $1 AND user_id <> $2', [projectId, ownerId], client);
  await upsertProjectMember(projectId, ownerId, 'owner', client);

  for (const assignment of memberAssignments) {
    if (assignment.userId !== ownerId) {
      await upsertProjectMember(projectId, assignment.userId, assignment.role || 'member', client);
    }
  }
}

async function listProjectMembers(projectId, client) {
  const result = await query(
    `
      SELECT
        pm.id,
        pm.project_id AS "projectId",
        pm.user_id AS "userId",
        pm.role,
        pm.created_at AS "createdAt",
        u.name,
        u.email,
        u.avatar_url AS "avatarUrl"
      FROM project_members pm
      JOIN users u ON u.id = pm.user_id
      WHERE pm.project_id = $1
      ORDER BY
        CASE pm.role
          WHEN 'owner' THEN 1
          WHEN 'admin' THEN 2
          ELSE 3
        END,
        u.name ASC
    `,
    [projectId],
    client,
  );

  return result.rows;
}

module.exports = {
  listProjectsForUser,
  getProjectForUser,
  getProjectMembership,
  insertProject,
  updateProject,
  deleteProject,
  upsertProjectMember,
  replaceProjectMembers,
  listProjectMembers,
};
