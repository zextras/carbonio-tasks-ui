/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Reference } from '@apollo/client';
import { type Modifier } from '@apollo/client/cache';
import { filter } from 'lodash';

import { type Task } from '../gql/types';

export const removeTaskFromList: (
	task: Pick<Task, '__typename' | 'id'>
) => Modifier<Reference[] | undefined> =
	(task) =>
	(existing, { toReference }) => {
		if (existing) {
			const taskRef = toReference(task);
			return filter(existing, (itemRef) => taskRef?.__ref !== itemRef.__ref);
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
