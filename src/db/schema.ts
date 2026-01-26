import { pgTable, text, timestamp, integer, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const groupTypeEnum = pgEnum('group_type', ['superior', 'medio-a', 'medio-b']);
export const statusEnum = pgEnum('status', ['active', 'pending']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'student']);
export const activityTypeEnum = pgEnum('activity_type', ['login', 'logout', 'create', 'update', 'delete']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firebaseUid: text('firebase_uid').unique().notNull(),
  email: text('email').unique().notNull(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  role: userRoleEnum('role').default('student').notNull(),
  lastLoginAt: timestamp('last_login_at'),
  lastLoginIp: text('last_login_ip'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Activity logs table
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: activityTypeEnum('action').notNull(),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  details: text('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Groups table
export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: groupTypeEnum('type').notNull(),
  leaderName: text('leader_name'),
  leaderAvatar: text('leader_avatar'),
  projectId: text('project_id'),
  status: statusEnum('status').default('active'),
  positionX: integer('position_x').default(0),
  positionY: integer('position_y').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Group members table
export const groupMembers = pgTable('group_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').references(() => groups.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Connections table
export const connections = pgTable('connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id').references(() => groups.id, { onDelete: 'cascade' }).notNull(),
  targetId: uuid('target_id').references(() => groups.id, { onDelete: 'cascade' }).notNull(),
  appName: text('app_name').notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Grades table - maintains history of all grade assignments
export const grades = pgTable('grades', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').references(() => groups.id, { onDelete: 'cascade' }).notNull(),
  grade: integer('grade').notNull(), // Stored as 0-100 (divide by 10 for display: 75 = 7.5)
  observations: text('observations'),
  gradedBy: uuid('graded_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  outgoingConnections: many(connections, { relationName: 'source' }),
  incomingConnections: many(connections, { relationName: 'target' }),
  grades: many(grades),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  source: one(groups, {
    fields: [connections.sourceId],
    references: [groups.id],
    relationName: 'source',
  }),
  target: one(groups, {
    fields: [connections.targetId],
    references: [groups.id],
    relationName: 'target',
  }),
}));

export const gradesRelations = relations(grades, ({ one }) => ({
  group: one(groups, {
    fields: [grades.groupId],
    references: [groups.id],
  }),
  gradedByUser: one(users, {
    fields: [grades.gradedBy],
    references: [users.id],
  }),
}));

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  activityLogs: many(activityLogs),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Types
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;
export type Connection = typeof connections.$inferSelect;
export type NewConnection = typeof connections.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Grade = typeof grades.$inferSelect;
export type NewGrade = typeof grades.$inferInsert;
