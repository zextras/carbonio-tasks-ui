/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react';

import {
	type ApolloCache,
	type NormalizedCacheObject,
	type Reference,
	useMutation
} from '@apollo/client';
import { filter } from 'lodash';

import { useActiveItem } from './useActiveItem';
import { CompleteTaskDocument, type Task } from '../gql/types';

type CompleteActionFn = () => Promise<void>;

function removeTaskFromList(
	task: Pick<Task, 'id' | '__typename'>,
	cache: ApolloCache<NormalizedCacheObject>
): void {
	cache.modify({
		fields: {
			findTasks(existing: Reference[] | undefined, { toReference }): Reference[] | undefined {
				if (existing) {
					const taskRef = toReference(task);
					return filter(existing, (itemRef) => taskRef?.__ref !== itemRef.__ref);
				}
				return existing;
			}
		}
	});
}
export const useCompleteAction = (taskId: string): CompleteActionFn => {
	const [completeTask] = useMutation(CompleteTaskDocument, {
		variables: {
			id: taskId
		}
	});

	const { removeActive } = useActiveItem();

	return useCallback(
		() =>
			completeTask({
				update: (cache, { data }) => {
					if (data?.updateTask) {
						removeTaskFromList(data.updateTask, cache);
					}
				}
			}).then((result) => {
				if (result.data?.updateTask) {
					// replace history so that a back navigation does not re-open the displayer
					// for a task which is no more visible
					removeActive({ replace: true });
				}
			}),
		[completeTask, removeActive]
	);
};
