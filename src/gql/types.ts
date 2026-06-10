/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Re-exports the generated operation/fragment types, enums, inputs and TypedDocumentNodes, and adds
// the bare schema types the client preset does not emit (it is operations-first by design).
export * from './graphql';

import type { TaskFragment } from './graphql';

/**
 * Schema object type for a `Task`. The `Task` fragment selects every field, so it provides the
 * shape; the nullable fields are made optional to match the schema (they may be absent on partial
 * task objects), and `__typename` is added as on any cache entity.
 */
type NullableTaskField = 'description' | 'reminderAllDay' | 'reminderAt';
export type Task = Omit<TaskFragment, NullableTaskField> &
	Partial<Pick<TaskFragment, NullableTaskField>> & { __typename?: 'Task' };

/** Arguments of the `Query.getTask` field. */
export type QueryGetTaskArgs = { taskId: string };
