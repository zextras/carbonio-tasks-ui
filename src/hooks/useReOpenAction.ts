/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react';

import { type FetchResult, useMutation } from '@apollo/client';

import { addTaskToList } from '../apollo/cacheUtils';
import { Status, UpdateTaskStatusDocument, type UpdateTaskStatusMutation } from '../gql/types';

type ReOpenActionFn = () => Promise<FetchResult<UpdateTaskStatusMutation>>;

export const useReOpenAction = (taskId: string): ReOpenActionFn => {
	const [updateTaskStatus] = useMutation(UpdateTaskStatusDocument, {
		variables: {
			id: taskId,
			status: Status.Complete
		}
	});

	return useCallback(
		() =>
			updateTaskStatus({
				update: (cache, { data }) => {
					if (data?.updateTask) {
						cache.modify({
							fields: {
								findTasks: addTaskToList(data.updateTask)
							}
						});
					}
				}
			}),
		[updateTaskStatus]
	);
};
