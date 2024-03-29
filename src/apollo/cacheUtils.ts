/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Reference } from '@apollo/client';
import { type Modifier } from '@apollo/client/cache';
import { filter, findIndex, map } from 'lodash';

import { type Task } from '../gql/types';

export const removeTaskFromList: (
	...tasks: Pick<Task, '__typename' | 'id'>[]
) => Modifier<readonly Reference[] | Reference> =
	(...tasks) =>
	(existing, { toReference }) => {
		if (existing && Array.isArray(existing)) {
			const taskRefs = map(tasks, (task) => toReference(task)?.__ref);
			return filter(existing, (itemRef) => !taskRefs.includes(itemRef.__ref));
		}
		return existing;
	};

export const addTaskToList: (
	task: Pick<Task, '__typename' | 'id'>
) => Modifier<readonly Reference[] | Reference> =
	(task) =>
	(existing, { toReference, readField }) => {
		const newTaskRef = toReference(task);
		if (existing && newTaskRef && Array.isArray(existing)) {
			const updatedList = [...existing];
			const index = findIndex(existing, (existingRef) => {
				const existingTaskCreatedAt = readField<number>({
					fieldName: 'createdAt',
					from: existingRef
				});
				const newTaskCreatedAt = readField<number>({ fieldName: 'createdAt', from: newTaskRef });
				return (
					existingTaskCreatedAt !== undefined &&
					newTaskCreatedAt !== undefined &&
					existingTaskCreatedAt < newTaskCreatedAt
				);
			});
			if (index >= 0) {
				updatedList.splice(index, 0, newTaskRef);
			} else {
				updatedList.push(newTaskRef);
			}
			return updatedList;
		}
		return existing;
	};
