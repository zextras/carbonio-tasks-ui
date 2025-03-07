/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type * as shell from '@zextras/carbonio-shell-ui';
import { type TOptions } from 'i18next';
import { noop } from 'lodash';

import { LOGGED_USER, USER_SETTINGS } from '../../src/mocks/constants';

export const useUserAccounts = (): shell.Account[] => [LOGGED_USER];
export const useUserSettings = (): shell.AccountSettings => USER_SETTINGS;
export const ACTION_TYPES = {
	NEW: 'new'
};

export const useBoardHooks = (): shell.BoardHooksContext => ({
	closeBoard: noop,
	updateBoard: noop,
	setCurrentBoard: noop,
	getBoardContext: <T>(): T => {
		// implement the mock when required, for now leave it unimplemented
		throw new Error('not implemented');
	},
	getBoard: <T>(): shell.Board<T> => {
		// implement the mock when required, for now leave it unimplemented
		throw new Error('not implemented');
	}
});

// eslint-disable-next-line arrow-body-style
export const useBoard: <T>() => shell.Board<T> = () => {
	return {
		id: '',
		title: '',
		app: '',
		boardViewId: '',
		icon: ''
	};
};

export const getBoardById: typeof shell.getBoardById = () => undefined;

export const closeBoard: typeof shell.closeBoard = () => undefined;

export const t = (key: string, defaultValue?: string | TOptions): string => {
	if (typeof defaultValue === 'string') {
		return defaultValue;
	}
	return defaultValue?.defaultValue || key;
};

const notificationManagerInstance: shell.INotificationManager = {
	notify: noop,
	playSound: noop,
	showPopup: noop,
	multipleNotify: noop
};
export const getNotificationManager = (): shell.INotificationManager => notificationManagerInstance;

export const updatePrimaryBadge: typeof shell.updatePrimaryBadge = noop;
export const useAuthenticated: typeof shell.useAuthenticated = () => true;
export const addRoute: typeof shell.addRoute = () => '';
export const addBoardView: typeof shell.addBoardView = () => '';
export const registerActions: typeof shell.registerActions = () => undefined;
export const upsertApp: typeof shell.upsertApp = () => undefined;
