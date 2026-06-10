/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type GraphQLResponseResolver, HttpResponse } from 'msw';

import {
	Priority,
	Status,
	type UpdateTaskMutation,
	type UpdateTaskMutationVariables
} from '../../gql/types';

// returned response must be reImplemented to have consistent data
const handler: GraphQLResponseResolver<UpdateTaskMutation, UpdateTaskMutationVariables> = ({
	variables
}) => {
	const { updateTask } = variables;
	return HttpResponse.json({
		data: {
			// Apollo needs `__typename` at runtime to normalize the result into the cache; the
			// operation result type no longer models it, so we add it back and cast.
			updateTask: {
				id: updateTask.id,
				status: updateTask.status || Status.Open,
				title: updateTask.title || '',
				reminderAt: updateTask.reminderAt ?? null,
				reminderAllDay: updateTask.reminderAllDay ?? null,
				description: updateTask.description ?? null,
				priority: updateTask.priority || Priority.Low,
				createdAt: 1,
				__typename: 'Task'
			} as UpdateTaskMutation['updateTask']
		}
	});
};

export default handler;
