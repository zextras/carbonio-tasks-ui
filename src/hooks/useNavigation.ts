/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { pushHistory, replaceHistory } from '@zextras/carbonio-shell-ui';

import { TASKS_ROUTE } from '../constants';

export type UseNavigationReturnType = {
	navigateTo: (path: string, options?: { replace: boolean }) => void;
};

export const useNavigation = (): UseNavigationReturnType => {
	const navigateTo = useCallback<UseNavigationReturnType['navigateTo']>((path, options) => {
		if (options?.replace) {
			replaceHistory({
				route: TASKS_ROUTE,
				path
			});
		} else {
			pushHistory({
				route: TASKS_ROUTE,
				path
			});
		}
	}, []);

	return { navigateTo };
};
