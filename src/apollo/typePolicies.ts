/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FieldFunctionOptions, Reference, TypePolicies } from '@apollo/client';

import type { GetTaskQueryVariables, QueryGetTaskArgs, Task } from '../gql/types';

export const typePolicies: TypePolicies = {
	Query: {
		fields: {
			getTask: {
				read(
					_existing: Reference | undefined,
					options: FieldFunctionOptions<Partial<QueryGetTaskArgs>, Partial<GetTaskQueryVariables>>
				): Reference | undefined {
					const { args, toReference } = options;
					if (args?.taskId) {
						const typename: Task['__typename'] = 'Task';

						return toReference({
							__typename: typename,
							id: args.taskId
						});
					}
					return undefined;
				}
			}
		}
	}
};
