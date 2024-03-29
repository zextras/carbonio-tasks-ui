/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect, useRef } from 'react';

import { useParams } from 'react-router-dom';

import { useNavigation, type UseNavigationReturnType } from './useNavigation';
import type { TasksPathParams } from '../types/commons';

type UseActiveItemReturnType = {
	activeItem: string;
	isActive: (id: string) => boolean;
	setActive: (id: string, options?: Parameters<UseNavigationReturnType['navigateTo']>[1]) => void;
	removeActive: (options?: Parameters<UseNavigationReturnType['navigateTo']>[1]) => void;
};

export const useActiveItem = (): UseActiveItemReturnType => {
	const { navigateTo } = useNavigation();
	const { taskId } = useParams<TasksPathParams>();
	const activeTaskIdRef = useRef<string>();

	useEffect(() => {
		activeTaskIdRef.current = taskId;
	}, [taskId]);

	/**
	 * Check if the given id matches the active id.
	 * The callback is memoized and is not recreated when the active item changes.
	 * Use activeItem field if you need the dependency to update.
	 */
	const isActive = useCallback<UseActiveItemReturnType['isActive']>(
		(id) => activeTaskIdRef.current === id,
		[]
	);

	const setActive = useCallback<UseActiveItemReturnType['setActive']>(
		(id, options) => {
			navigateTo(id, options);
		},
		[navigateTo]
	);

	const removeActive = useCallback<UseActiveItemReturnType['removeActive']>(
		(options) => {
			navigateTo('/', options);
		},
		[navigateTo]
	);

	return { activeItem: taskId, isActive, setActive, removeActive };
};
