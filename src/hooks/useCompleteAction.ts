/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type ApolloLink } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

import { Status, UpdateTaskStatusDocument, type UpdateTaskStatusMutation } from '../gql/types';

type CompleteActionFn = () => Promise<ApolloLink.Result<UpdateTaskStatusMutation>>;

export const useCompleteAction = (taskId: string): CompleteActionFn => {
	const [updateTaskStatus] = useMutation(UpdateTaskStatusDocument, {
		variables: {
			id: taskId,
			status: Status.Complete
		}
	});

	return updateTaskStatus;
};
