/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Account, AccountSettings } from '@zextras/carbonio-shell-ui';
import { createMemoryHistory } from 'history';

import { LOGGED_USER, USER_SETTINGS } from '../../src/mocks/constants';

const history = createMemoryHistory();

function replaceHistoryMock(location: string | Location): void {
	if (typeof location === 'string') {
		history.replace(location);
	} else {
		history.replace({ ...location, pathname: location.pathname });
	}
}

function pushHistoryMock(location: string | Location): void {
	if (typeof location === 'string') {
		history.push(location);
	} else {
		history.push({ ...location, pathname: location.pathname });
	}
}

export const useUserAccounts = (): Account[] => [LOGGED_USER];
export const useUserSettings = (): AccountSettings => USER_SETTINGS;
export const replaceHistory = jest.fn(replaceHistoryMock);
export const pushHistory = jest.fn(pushHistoryMock);
export const ACTION_TYPES = {
	NEW: 'new'
};
