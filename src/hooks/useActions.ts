/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { type Action } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { useCompleteAction } from './useCompleteAction';
import { type Task } from '../gql/types';

export const useActions = (taskId: Task['id']): Action[] => {
	const [t] = useTranslation();
	const completeAction = useCompleteAction(taskId);

	const editAction = useCallback<Action['onClick']>(() => {
		console.log('edit', taskId);
		// todo: open board to edit task
	}, [taskId]);

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
