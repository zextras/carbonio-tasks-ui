/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { type Action, useSnackbar } from '@zextras/carbonio-design-system';
import { addBoard, getBoardById, reopenBoards, setCurrentBoard } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { useCompleteAction } from './useCompleteAction';
import { useRestoreAction } from './useRestoreAction';
import { TASKS_ROUTE } from '../constants';
import { type Task } from '../gql/types';

export const useActions = (task: Pick<Task, 'id' | 'title'>): Action[] => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const completeAction = useCompleteAction(task.id);
	const restoreAction = useRestoreAction(task.id);

	const restoreActionHandler = useCallback(() => {
		restoreAction().then(() => {
			createSnackbar({
				type: 'success',
				key: `snackbar-${Date.now()}`,
				label: t('snackbar.restoreTask', 'Task restored in All tasks folder'),
				hideButton: true
			});
		});
	}, [createSnackbar, restoreAction, t]);

	const completeActionHandler = useCallback(() => {
		completeAction().then(() => {
			createSnackbar({
				type: 'success',
				key: `snackbar-${Date.now()}`,
				label: t('snackbar.completeTask', 'Task "{{taskTitle}}" completed', {
					replace: {
						taskTitle: `${
							task.title.length > 50 ? task.title.substring(0, 50).concat('...') : task.title
						}`
					}
				}),
				actionLabel: t('action.undo', 'Undo'),
				onActionClick: restoreActionHandler
			});
		});
	}, [completeAction, createSnackbar, restoreActionHandler, t, task.title]);

	const editAction = useCallback<Action['onClick']>(() => {
		const board = getBoardById(`edit-task-${task.id}`);
		if (board) {
			setCurrentBoard(board.id);
			reopenBoards();
		} else {
			addBoard({
				id: `edit-task-${task.id}`,
				url: `${TASKS_ROUTE}/edit`,
				title: t('board.editTask.title', 'Edit Task'),
				context: { taskId: task.id }
			});
		}
	}, [t, task.id]);

	// actions ordered by importance (most important first)
	return useMemo<Action[]>(
		(): Action[] => [
			{
				id: 'complete',
				label: t('action.complete', 'Complete'),
				icon: 'CheckmarkCircle2Outline',
				onClick: completeActionHandler
			},
			{
				id: 'edit',
				label: t('action.edit', 'Edit'),
				icon: 'Edit2Outline',
				onClick: editAction
			}
		],
		[completeActionHandler, editAction, t]
	);
};
