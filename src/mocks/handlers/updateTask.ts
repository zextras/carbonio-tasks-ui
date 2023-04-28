/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	Priority,
	Status,
	type UpdateTaskMutation,
	type UpdateTaskMutationVariables
} from '../../gql/types';
import { type GraphQLResponseResolver } from '../../types/commons';

// returned response must be reImplemented to have consistent data
const handler: GraphQLResponseResolver<UpdateTaskMutation, UpdateTaskMutationVariables> = (
	req,
	res,
	context
) => {
	const { updateTask } = req.variables;
	return res(
		context.data({
			updateTask: {
				id: updateTask.id,
				status: updateTask.status || Status.Open,
				title: updateTask.title || '',
				reminderAt: updateTask.reminderAt,
				reminderAllDay: updateTask.reminderAllDay,
				description: updateTask.description,
				priority: updateTask.priority || Priority.Low,
				createdAt: 1,
				__typename: 'Task'
			}
		})
	);
};

export default handler;
