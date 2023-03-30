/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { type Reference, useMutation, useQuery } from '@apollo/client';
import { type Modifier } from '@apollo/client/cache';
import { useSnackbar } from '@zextras/carbonio-design-system';
import { t, useBoardHooks } from '@zextras/carbonio-shell-ui';
import { filter, trim } from 'lodash';

import { CommonTaskBoard, type CommonTaskBoardProps } from './CommonTaskBoard';
import { NewTaskLimitBanner } from '../../components/NewTaskLimitBanner';
import { MAX_TASKS_LIMIT } from '../../constants';
import {
	CreateTaskDocument,
	FindTasksDocument,
	type FindTasksQuery,
	Priority,
	Status,
	type Task
} from '../../gql/types';
import { type NonNullableList } from '../../types/utils';
import { identity } from '../../utils';

const addTaskToList: (task: Task) => Modifier<Reference[] | undefined> =
	(task) =>
	(existingTasksRefs, { toReference }) => {
		const newTaskRef = toReference(task);
		if (existingTasksRefs && newTaskRef) {
			return [newTaskRef, ...existingTasksRefs];
		}
		return existingTasksRefs;
	};

const NewTaskBoard = (): JSX.Element => {
	const { closeBoard } = useBoardHooks();
	const createSnackbar = useSnackbar();

	const { data: findTasksResult } = useQuery(FindTasksDocument, {
		variables: {
			status: Status.Open
		},
		fetchPolicy: 'cache-first',
		notifyOnNetworkStatusChange: true,
		errorPolicy: 'all'
	});

	const tasks = useMemo(
		(): NonNullableList<FindTasksQuery['findTasks']> =>
			filter(findTasksResult?.findTasks, identity),
		[findTasksResult]
	);

	const [createTaskMutation] = useMutation(CreateTaskDocument);

	const onConfirm = useCallback<CommonTaskBoardProps['onConfirm']>(
		({ title, priority, description, reminderAt, reminderAllDay, enableReminder }) => {
			if (tasks.length >= MAX_TASKS_LIMIT) {
				createSnackbar({
					key: new Date().toLocaleString(),
					type: 'warning',
					label: t(
						'snackbar.tasksLimitReached',
						'You have reached your 200 tasks. To create more complete your previous tasks.'
					),
					replace: false,
					hideButton: true
				});
			} else {
				createTaskMutation({
					variables: {
						newTask: {
							status: Status.Open,
							description: trim(description).length > 0 ? trim(description) : undefined,
							priority,
							title,
							reminderAt: enableReminder ? reminderAt.getTime() : undefined,
							reminderAllDay: enableReminder ? reminderAllDay : undefined
						}
					},
					update(cache, { data }) {
						if (data?.createTask) {
							cache.modify({
								fields: {
									findTasks: addTaskToList(data.createTask)
								}
							});
						}
					}
				});
				closeBoard();
			}
		},
		[closeBoard, createSnackbar, createTaskMutation, tasks.length]
	);

	return (
		<CommonTaskBoard
			initialTitle={''}
			initialPriority={Priority.Medium}
			initialDescription={''}
			initialEnableReminder={false}
			initialIsAllDay={false}
			initialDate={new Date()}
			onConfirm={onConfirm}
			confirmLabel={t('board.confirmButton.create', 'create')}
			banner={
				(tasks.length === MAX_TASKS_LIMIT - 1 && (
					<NewTaskLimitBanner
						bannerLabel={t(
							'newTaskBoard.banner.lastTask',
							'This is the last task you can create. To create more complete your previous tasks.'
						)}
						bannerIcon={'InfoOutline'}
						bannerColor={'info'}
					/>
				)) ||
				(tasks.length >= MAX_TASKS_LIMIT && (
					<NewTaskLimitBanner
						bannerLabel={t(
							'newTaskBoard.banner.limitReached',
							'You have reached your 200 tasks. To create more complete your previous tasks.'
						)}
						bannerIcon={'AlertTriangleOutline'}
						bannerColor={'warning'}
					/>
				)) ||
				undefined
			}
			defaultBoardTabTitle={t('board.newTask.title', 'New Task')}
		/>
	);
};

export default NewTaskBoard;
