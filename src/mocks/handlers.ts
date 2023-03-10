/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { graphql, type RequestHandler } from 'msw';

import findTasks from './handlers/findTasks';
import getTask from './handlers/getTask';
import {
	type FindTasksQuery,
	type FindTasksQueryVariables,
	type GetTaskQuery,
	type GetTaskQueryVariables
} from '../gql/types';

const handlers: RequestHandler[] = [
	graphql.query<FindTasksQuery, FindTasksQueryVariables>('findTasks', findTasks),
	graphql.query<GetTaskQuery, GetTaskQueryVariables>('getTask', getTask)
];

export default handlers;
