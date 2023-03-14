/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react';

import { type Account, type AccountSettings, type HistoryParams } from '@zextras/carbonio-shell-ui';
import { trimStart } from 'lodash';
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
export const useReplaceHistoryCallback = jest.fn(useReplaceHistoryMock);
export const usePushHistoryCallback = jest.fn(usePushHistoryMock);
export const ACTION_TYPES = {
	NEW: 'new'
};

export const useBoardHooks = jest.fn(() => ({
	closeBoard: jest.fn(),
	updateBoard: jest.fn(),
	setCurrentBoard: jest.fn(),
	getBoardContext: jest.fn(),
	getBoard: jest.fn()
}));
