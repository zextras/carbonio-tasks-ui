/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react';

import { type FetchResult, useMutation } from '@apollo/client';

import { useActiveItem } from './useActiveItem';
import { removeTaskFromList } from '../apollo/cacheUtils';
import { TrashTaskDocument, type TrashTaskMutation } from '../gql/types';

type TrashActionFn = () => Promise<FetchResult<TrashTaskMutation>>;

export const useTrashAction = (taskId: string): TrashActionFn => {
	const { removeActive } = useActiveItem();
	const [trashTask] = useMutation(TrashTaskDocument, {
		variables: {
			taskId
		}
	});

	return useCallback(
		() =>
			trashTask({
				update: (cache, { data }) => {
					if (data?.trashTask) {
						cache.modify({
							fields: {
								findTasks: removeTaskFromList({ id: data.trashTask, __typename: 'Task' })
							}
						});
					}
				}
			}).then((result) => {
				if (result.data?.trashTask) {
					// replace history so that a back navigation does not re-open the displayer
					// for a task which is no more visible
					removeActive({ replace: true });
				}
				return result;
			}),
		[removeActive, trashTask]
	);
};
