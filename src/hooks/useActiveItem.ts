/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { useRouteMatch } from 'react-router-dom';

import { useNavigation } from './useNavigation';
import type { TasksPathParams } from '../types/commons';

type UseActiveItemReturnType = {
	isActive: (id: string) => boolean;
	setActive: (id: string) => void;
	removeActive: () => void;
};

export const useActiveItem = (): UseActiveItemReturnType => {
	const { navigateTo } = useNavigation();
	const routeMatch = useRouteMatch<TasksPathParams>();

	const isActive = useCallback<UseActiveItemReturnType['isActive']>(
		(id) => routeMatch?.params.taskId === id,
		[routeMatch?.params.taskId]
	);

	const setActive = useCallback<UseActiveItemReturnType['setActive']>(
		(id) => {
			navigateTo(id);
		},
		[navigateTo]
	);

	const removeActive = useCallback<UseActiveItemReturnType['removeActive']>(() => {
		navigateTo('/');
	}, [navigateTo]);

	return { isActive, setActive, removeActive };
};
