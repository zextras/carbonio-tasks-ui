/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect, useRef } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import type { TasksPathParams } from '../types/commons';

type UseActiveItemReturnType = {
	activeItem: string;
	isActive: (id: string) => boolean;
	setActive: (id: string, options?: { replace?: boolean }) => void;
	removeActive: (options?: { replace?: boolean }) => void;
};

export const useActiveItem = (): UseActiveItemReturnType => {
	const navigate = useNavigate();
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
			navigate(`../${id}`, { replace: options?.replace });
		},
		[navigate]
	);

	const removeActive = useCallback<UseActiveItemReturnType['removeActive']>(
		(options) => {
			navigate('..', { replace: options?.replace });
		},
		[navigate]
	);

	return { activeItem: taskId!, isActive, setActive, removeActive };
};
