const { z } = require('zod');

const { PROJECT_PRIORITIES, TASK_PRIORITIES } = require('../../shared/constants/priorities');
const { USER_ROLES } = require('../../shared/constants/roles');
const { PROJECT_STATUSES, TASK_STATUSES } = require('../../shared/constants/statuses');

const emptyStringToUndefined = (value) => {
  if (value === '') {
    return undefined;
  }

  return value;
};

const projectMemberRoleSchema = z.enum(['admin', 'member', 'viewer']);
const booleanFromUnknown = z.preprocess((value) => {
  if (value === '' || value == null) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') return true;
  if (value === 'false') return false;

  return value;
}, z.boolean().optional());

const projectMemberAssignmentSchema = z.object({
  userId: z.string().uuid(),
  role: projectMemberRoleSchema.default('member'),
});

const projectPayloadSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1200).optional().default(''),
  status: z.enum(PROJECT_STATUSES).optional().default('active'),
  startDate: z.string().trim().nullable().optional(),
  dueDate: z.string().trim().min(1),
  priority: z.enum(PROJECT_PRIORITIES).optional().default('medium'),
  archived: z.boolean().optional().default(false),
  memberAssignments: z.array(projectMemberAssignmentSchema).optional().default([]),
  memberIds: z.array(z.string().uuid()).optional().default([]),
});

const projectUpdateSchema = projectPayloadSchema.extend({
  id: z.string().uuid(),
});

const idSchema = z.object({
  id: z.string().uuid(),
});

const taskPayloadSchema = z.object({
  projectId: z.string().uuid(),
  assignedTo: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional().default(''),
  priority: z.enum(TASK_PRIORITIES).optional().default('medium'),
  status: z.enum(TASK_STATUSES).optional().default('todo'),
  dueDate: z.string().trim().nullable().optional(),
});

const taskUpdateSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  dueDate: z.string().trim().nullable().optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(2).max(100),
  role: z.enum(USER_ROLES).optional().default('member'),
  avatarUrl: z.string().url().optional().nullable(),
});

const removeMemberSchema = z.object({
  userId: z.string().uuid(),
});

const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')).nullable(),
  themePreference: z.enum(['light', 'dark']).optional(),
  notificationsEnabled: z.boolean().optional(),
});

const projectQuerySchema = z.object({
  search: z.preprocess(emptyStringToUndefined, z.string().optional()),
  status: z.preprocess(emptyStringToUndefined, z.enum(PROJECT_STATUSES).optional()),
  archived: booleanFromUnknown,
  sort: z
    .preprocess(emptyStringToUndefined, z.enum(['updated_desc', 'due_asc', 'progress_desc', 'title_asc']).optional())
    .optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

const taskQuerySchema = z.object({
  projectId: z.preprocess(emptyStringToUndefined, z.string().uuid().optional()),
  search: z.preprocess(emptyStringToUndefined, z.string().optional()),
  status: z.preprocess(emptyStringToUndefined, z.enum(TASK_STATUSES).optional()),
  priority: z.preprocess(emptyStringToUndefined, z.enum(TASK_PRIORITIES).optional()),
  sort: z
    .preprocess(
      emptyStringToUndefined,
      z.enum(['status_default', 'due_asc', 'updated_desc', 'priority_desc']).optional(),
    )
    .optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

const notificationReadSchema = z.object({
  id: z.string().uuid(),
});

const commentEntityTypeSchema = z.enum(['project', 'task']);

const commentPayloadSchema = z.object({
  entityType: commentEntityTypeSchema,
  entityId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});

const commentQuerySchema = z.object({
  entityType: commentEntityTypeSchema,
  entityId: z.string().uuid(),
});

module.exports = {
  projectPayloadSchema,
  projectUpdateSchema,
  idSchema,
  taskPayloadSchema,
  taskUpdateSchema,
  inviteMemberSchema,
  removeMemberSchema,
  profileUpdateSchema,
  projectQuerySchema,
  taskQuerySchema,
  notificationReadSchema,
  commentPayloadSchema,
  commentQuerySchema,
};
