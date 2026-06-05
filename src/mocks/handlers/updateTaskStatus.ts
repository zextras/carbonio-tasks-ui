/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type GraphQLResponseResolver, HttpResponse } from 'msw';

import {
	type UpdateTaskStatusMutation,
	type UpdateTaskStatusMutationVariables
} from '../../gql/types';

const handler: GraphQLResponseResolver<
	UpdateTaskStatusMutation,
	UpdateTaskStatusMutationVariables
> = ({ variables }) => {
	const { id, status } = variables;
	return HttpResponse.json({
		data: {
			// Apollo needs `__typename` at runtime to normalize the result into the cache; v6
			// operation result types no longer model it, so we add it back and cast.
			updateTask: {
				id,
				status,
				__typename: 'Task'
			} as UpdateTaskStatusMutation['updateTask']
		}
	});
};

export default handler;
