/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react';

import { type Reference, type ApolloLink } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

import { useActiveItem } from './useActiveItem';
import { removeTaskFromList } from '../apollo/cacheUtils';
import { TrashTaskDocument, type TrashTaskMutation } from '../gql/types';

type TrashActionFn = () => Promise<ApolloLink.Result<TrashTaskMutation>>;

export const useTrashAction = (taskId: string): TrashActionFn => {
	const { removeActive, isActive } = useActiveItem();
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
						cache.modify<{ findTasks: Reference[] }>({
							fields: {
								findTasks: removeTaskFromList({ id: data.trashTask, __typename: 'Task' })
							}
						});
					}
				}
			}).then((result) => {
				if (result.data?.trashTask && isActive(result.data.trashTask)) {
					// replace history so that a back navigation does not re-open the displayer
					// for a task which is no more visible
					removeActive({ replace: true });
				}
				return result;
			}),
		[isActive, removeActive, trashTask]
	);
};
