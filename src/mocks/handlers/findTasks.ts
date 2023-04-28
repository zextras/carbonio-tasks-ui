/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type FindTasksQuery, type FindTasksQueryVariables } from '../../gql/types';
import { type GraphQLResponseResolver } from '../../types/commons';
import { populateTaskList } from '../utils';

const handler: GraphQLResponseResolver<FindTasksQuery, FindTasksQueryVariables> = (
	req,
	res,
	context
) => {
	const tasks = populateTaskList();
	return res(
		context.data({
			findTasks: tasks
		})
	);
};

export default handler;
