/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type FetchResult, useMutation } from '@apollo/client';

import { Status, UpdateTaskStatusDocument, type UpdateTaskStatusMutation } from '../gql/types';

type RestoreActionFn = () => Promise<FetchResult<UpdateTaskStatusMutation>>;

export const useReopenAction = (taskId: string): RestoreActionFn => {
	const [updateTaskStatus] = useMutation(UpdateTaskStatusDocument, {
		variables: {
			id: taskId,
			status: Status.Open
		}
	});

	return updateTaskStatus;
};
