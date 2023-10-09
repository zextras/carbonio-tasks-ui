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
import { useReopenAction } from './useReopenAction';
import { TASKS_ROUTE } from '../constants';
import { Status, type Task } from '../gql/types';

function getSnackbarTitle(title: string): string {
	return title.length > 50 ? title.substring(0, 50).concat('...') : title;
}

export const useActions = (task: Pick<Task, 'id' | 'title' | 'status'>): Action[] => {
	const { id, title, status } = task;
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const completeAction = useCompleteAction(id);
	const reopenAction = useReopenAction(id);

	const reopenActionHandler = useCallback(() => {
		reopenAction().then(() => {
			createSnackbar({
				type: 'success',
				key: `snackbar-${Date.now()}`,
				label: t('snackbar.uncompleteTask', 'Task "{{taskTitle}}" uncompleted', {
					replace: {
						taskTitle: getSnackbarTitle(title)
					}
				}),
				hideButton: true
			});
		});
	}, [createSnackbar, reopenAction, t, title]);

	const completeActionHandler = useCallback(() => {
		completeAction().then(() => {
			createSnackbar({
				type: 'success',
				key: `snackbar-${Date.now()}`,
				label: t('snackbar.completeTask', 'Task "{{taskTitle}}" completed', {
					replace: {
						taskTitle: getSnackbarTitle(title)
					}
				}),
				hideButton: true
			});
		});
	}, [completeAction, createSnackbar, t, title]);

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

	return useMemo<Action[]>((): Action[] => {
		const orderedActions = [
			{
				id: 'edit',
				label: t('action.edit', 'Edit'),
				icon: 'Edit2Outline',
				onClick: editAction
			}
		];
		if (status === Status.Complete) {
			orderedActions.unshift({
				id: 'uncomplete',
				label: t('action.uncomplete', 'Uncomplete'),
				icon: 'RadioButtonOffOutline',
				onClick: reopenActionHandler
			});
		} else if (status === Status.Open) {
			orderedActions.unshift({
				id: 'complete',
				label: t('action.complete', 'Complete'),
				icon: 'CheckmarkCircle2Outline',
				onClick: completeActionHandler
			});
		}
		return orderedActions;
	}, [completeActionHandler, editAction, reopenActionHandler, status, t]);
};
