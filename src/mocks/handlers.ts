/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { graphql, type RequestHandler } from 'msw';

import findTasks from './handlers/findTasks';
import getTask from './handlers/getTask';
import updateTask from './handlers/updateTask';
import updateTaskStatus from './handlers/updateTaskStatus';
import {
	type UpdateTaskStatusMutation,
	type UpdateTaskStatusMutationVariables,
	type FindTasksQuery,
	type FindTasksQueryVariables,
	type GetTaskQuery,
	type GetTaskQueryVariables,
	type UpdateTaskMutation,
	type UpdateTaskMutationVariables
} from '../gql/types';

const handlers: RequestHandler[] = [
	graphql.query<FindTasksQuery, FindTasksQueryVariables>('findTasks', findTasks),
	graphql.query<GetTaskQuery, GetTaskQueryVariables>('getTask', getTask),
	graphql.mutation<UpdateTaskStatusMutation, UpdateTaskStatusMutationVariables>(
		'updateTaskStatus',
		updateTaskStatus
	),
	graphql.mutation<UpdateTaskMutation, UpdateTaskMutationVariables>('updateTask', updateTask)
];

export default handlers;
