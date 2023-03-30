/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Reference } from '@apollo/client';
import { type Modifier } from '@apollo/client/cache';
import { filter, map } from 'lodash';

import { type Task } from '../gql/types';

export const removeTaskFromList: (
	...tasks: Pick<Task, '__typename' | 'id'>[]
) => Modifier<Reference[] | undefined> =
	(...tasks) =>
	(existing, { toReference }) => {
		if (existing) {
			const taskRefs = map(tasks, (task) => toReference(task)?.__ref);
			return filter(existing, (itemRef) => !taskRefs.includes(itemRef.__ref));
		}
		return existing;
	};

export const addTaskToList: (
	task: Pick<Task, '__typename' | 'id'>
) => Modifier<Reference[] | undefined> =
	(task) =>
	(existing, { toReference }) => {
		const newTaskRef = toReference(task);
		if (existing && newTaskRef) {
			return [newTaskRef, ...existing];
		}
		return existing;
	};
