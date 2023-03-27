/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { type Action } from '@zextras/carbonio-design-system';
import { addBoard, getBoardById, reopenBoards, setCurrentBoard } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { useCompleteAction } from './useCompleteAction';
import { TASKS_ROUTE } from '../constants';
import { type Task } from '../gql/types';

export const useActions = (taskId: Task['id']): Action[] => {
	const [t] = useTranslation();
	const completeAction = useCompleteAction(taskId);

	const editAction = useCallback<Action['onClick']>(() => {
		const board = getBoardById(`edit-task-${taskId}`);
		if (board) {
			setCurrentBoard(board.id);
			reopenBoards();
		} else {
			addBoard({
				id: `edit-task-${taskId}`,
				url: `${TASKS_ROUTE}/edit`,
				title: t('board.editTask.title', 'Edit Task'),
				context: { taskId }
			});
		}
	}, [t, taskId]);

	// actions ordered by importance (most important first)
	return useMemo<Action[]>(
		(): Action[] => [
			{
				id: 'complete',
				label: t('action.complete', 'Complete'),
				icon: 'CheckmarkCircle2Outline',
				onClick: completeAction
			},
			{
				id: 'edit',
				label: t('action.edit', 'Edit'),
				icon: 'Edit2Outline',
				onClick: editAction
			}
		],
		[completeAction, editAction, t]
	);
};
