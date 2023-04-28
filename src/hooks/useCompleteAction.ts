/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react';

import { type FetchResult, useMutation } from '@apollo/client';

import { useActiveItem } from './useActiveItem';
import { removeTaskFromList } from '../apollo/cacheUtils';
import { Status, UpdateTaskStatusDocument, type UpdateTaskStatusMutation } from '../gql/types';

type CompleteActionFn = () => Promise<FetchResult<UpdateTaskStatusMutation>>;

export const useCompleteAction = (taskId: string): CompleteActionFn => {
	const [updateTaskStatus] = useMutation(UpdateTaskStatusDocument, {
		variables: {
			id: taskId,
			status: Status.Complete
		}
	});

	const { removeActive } = useActiveItem();

	return useCallback(
		() =>
			updateTaskStatus({
				update: (cache, { data }) => {
					if (data?.updateTask) {
						cache.modify({
							fields: {
								findTasks: removeTaskFromList(data.updateTask)
							}
						});
					}
				}
			}).then((result) => {
				if (result.data?.updateTask) {
					// replace history so that a back navigation does not re-open the displayer
					// for a task which is no more visible
					removeActive({ replace: true });
				}
				return result;
			}),
		[updateTaskStatus, removeActive]
	);
};
