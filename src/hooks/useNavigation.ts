/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { usePushHistoryCallback } from '@zextras/carbonio-shell-ui';

import { TASKS_ROUTE } from '../constants';

export type UseNavigationReturnType = {
	navigateTo: (path: string) => void;
};

export const useNavigation = (): UseNavigationReturnType => {
	const pushHistory = usePushHistoryCallback();

	const navigateTo = useCallback<UseNavigationReturnType['navigateTo']>(
		(path) => {
			pushHistory({
				route: TASKS_ROUTE,
				path
			});
		},
		[pushHistory]
	);

	return { navigateTo };
};
