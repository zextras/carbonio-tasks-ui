/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type GetTaskQuery, type GetTaskQueryVariables } from '../../gql/types';
import { type GraphQLResponseResolver } from '../../types/commons';
import { populateTask } from '../utils';

const handler: jest.MockedFunction<GraphQLResponseResolver<GetTaskQuery, GetTaskQueryVariables>> =
	jest.fn((req, res, context) => {
		const { taskId } = req.variables;
		const task = populateTask();
		task.id = taskId;
		return res(
			context.data({
				getTask: task
			})
		);
	});

export default handler;
