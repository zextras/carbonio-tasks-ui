/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	type UpdateTaskStatusMutation,
	type UpdateTaskStatusMutationVariables
} from '../../gql/types';
import { type GraphQLResponseResolver } from '../../types/commons';

const handler: GraphQLResponseResolver<
	UpdateTaskStatusMutation,
	UpdateTaskStatusMutationVariables
> = (req, res, context) => {
	const { id, status } = req.variables;
	return res(
		context.data({
			updateTask: {
				id,
				status,
				__typename: 'Task'
			}
		})
	);
};

export default handler;
