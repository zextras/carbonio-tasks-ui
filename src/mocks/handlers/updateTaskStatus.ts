/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	type UpdateTaskStatusMutation,
	type UpdateTaskStatusMutationVariables,
	Status
} from '../../gql/types';
import { type GraphQLResponseResolver } from '../../types/commons';

const handler: jest.MockedFunction<
	GraphQLResponseResolver<UpdateTaskStatusMutation, UpdateTaskStatusMutationVariables>
> = jest.fn((req, res, context) => {
	const { id } = req.variables;
	return res(
		context.data({
			updateTask: {
				id,
				status: Status.Complete,
				__typename: 'Task'
			}
		})
	);
});

export default handler;
