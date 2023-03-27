/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	type GetTaskQuery,
	type GetTaskQueryVariables,
	type Task,
	TaskFragmentDoc
} from '../../gql/types';
import { type GraphQLResponseResolver } from '../../types/commons';
import { populateTask } from '../utils';

const handler: GraphQLResponseResolver<GetTaskQuery, GetTaskQueryVariables> = (
	req,
	res,
	context
) => {
	const { taskId } = req.variables;
	const cachedData = global.apolloClient.cache.readFragment({
		fragment: TaskFragmentDoc,
		id: global.apolloClient.cache.identify({
			__typename: 'Task',
			id: taskId
		} satisfies Pick<Task, '__typename' | 'id'>)
	});
	const task = populateTask(cachedData || undefined);
	task.id = taskId;
	return res(
		context.data({
			getTask: task
		})
	);
};

export default handler;
