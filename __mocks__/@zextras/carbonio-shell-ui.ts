/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react';

import {
	type BoardHooksContext,
	type Account,
	type AccountSettings,
	type Board,
	type HistoryParams,
	type INotificationManager,
	type AppSetters
} from '@zextras/carbonio-shell-ui';
import { type TOptions } from 'i18next';
import { noop, trimStart } from 'lodash';
import { useHistory } from 'react-router-dom';

import { LOGGED_USER, USER_SETTINGS } from '../../src/mocks/constants';

function parsePath(path: string): string {
	return `/${trimStart(path, '/')}`;
}

function useReplaceHistoryMock(): (params: HistoryParams) => void {
	const history = useHistory();

	return useCallback(
		(location: string | HistoryParams) => {
			if (typeof location === 'string') {
				history.replace(parsePath(location));
			} else if (typeof location.path === 'string') {
				history.replace(parsePath(location.path));
			} else {
				history.replace(location.path);
			}
		},
		[history]
	);
}

function usePushHistoryMock(): (params: HistoryParams) => void {
	const history = useHistory();

	return useCallback(
		(location: string | HistoryParams) => {
			if (typeof location === 'string') {
				history.push(parsePath(location));
			} else if (typeof location.path === 'string') {
				history.push(parsePath(location.path));
			} else {
				history.push(location.path);
			}
		},
		[history]
	);
}

export const useUserAccounts = (): Account[] => [LOGGED_USER];
export const useUserSettings = (): AccountSettings => USER_SETTINGS;
export const useReplaceHistoryCallback = useReplaceHistoryMock;
export const usePushHistoryCallback = usePushHistoryMock;
export const ACTION_TYPES = {
	NEW: 'new'
};

export const useBoardHooks = (): BoardHooksContext => ({
	closeBoard: noop,
	updateBoard: noop,
	setCurrentBoard: noop,
	getBoardContext: <T>(): T => {
		// implement the mock when required, for now leave it unimplemented
		throw new Error('not implemented');
	},
	getBoard: <T>(): Board<T> => {
		// implement the mock when required, for now leave it unimplemented
		throw new Error('not implemented');
	}
});

// eslint-disable-next-line arrow-body-style
export const useBoard: <T>() => Board<T> = () => {
	return {
		id: '',
		title: '',
		app: '',
		url: '',
		icon: ''
	};
};

export const t = (key: string, defaultValue?: string | TOptions): string => {
	if (typeof defaultValue === 'string') {
		return defaultValue;
	}
	return defaultValue?.defaultValue || key;
};

const notificationManagerInstance: INotificationManager = {
	notify: noop,
	playSound: noop,
	showPopup: noop,
	multipleNotify: noop
};
export const getNotificationManager = (): INotificationManager => notificationManagerInstance;

export const updatePrimaryBadge: AppSetters['updatePrimaryBadge'] = noop;
