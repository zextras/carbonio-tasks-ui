/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { vi } from 'vitest';

vi.mock('@zextras/carbonio-shell-ui');
import React from 'react';

import * as shell from '@zextras/carbonio-shell-ui';

import App from './app';
import { TASKS_APP_ID, TASKS_ROUTE } from './constants';
import { setup } from './utils/testUtils';
import { ACTION_TYPES } from '../__mocks__/@zextras/carbonio-shell-ui';

vi.mock('./components/RemindersManager');

describe('App', () => {
	describe('User authenticated', () => {
		it('should call addRoute', () => {
			const addRouteMock = vi.spyOn(shell, 'addRoute');
			setup(<App />);
			expect(addRouteMock).toHaveBeenCalledWith<Parameters<typeof shell.addRoute>>(
				expect.objectContaining({
					route: TASKS_ROUTE,
					position: 600,
					visible: true,
					label: 'Tasks',
					primaryBar: 'CheckmarkCircle2Outline',
					secondaryBar: expect.anything(),
					appView: expect.anything()
				})
			);
		});

		it('should call addBoardView', () => {
			const addBoardViewMock = vi.spyOn(shell, 'addBoardView');
			setup(<App />);
			expect(addBoardViewMock).toHaveBeenCalledWith<Parameters<typeof shell.addBoardView>>(
				expect.objectContaining({
					id: `${TASKS_ROUTE}/new`,
					component: expect.anything()
				})
			);
			expect(addBoardViewMock).toHaveBeenCalledWith<Parameters<typeof shell.addBoardView>>(
				expect.objectContaining({
					id: `${TASKS_ROUTE}/edit`,
					component: expect.anything()
				})
			);
		});

		it('should call registerActions', () => {
			const registerActionsMock = vi.spyOn(shell, 'registerActions');
			setup(<App />);
			expect(registerActionsMock).toHaveBeenCalledWith<Parameters<typeof shell.registerActions>>(
				expect.objectContaining({
					id: 'new-task',
					type: ACTION_TYPES.NEW,
					action: expect.anything()
				})
			);
		});

		it('should call upsertApp', () => {
			const upsertAppMock = vi.spyOn(shell, 'upsertApp');
			setup(<App />);
			expect(upsertAppMock).toHaveBeenCalledWith<Parameters<typeof shell.upsertApp>>(
				expect.objectContaining({
					name: TASKS_APP_ID,
					display: 'Tasks'
				})
			);
		});
	});

	it('should not register the route, board and actions if the user is not authenticated', () => {
		vi.spyOn(shell, 'useAuthenticated').mockReturnValue(false);
		const addRouteMock = vi.spyOn(shell, 'addRoute');
		const addBoardViewMock = vi.spyOn(shell, 'addBoardView');
		const registerActionsMock = vi.spyOn(shell, 'registerActions');
		const upsertAppMock = vi.spyOn(shell, 'upsertApp');
		setup(<App />);
		expect(addRouteMock).not.toHaveBeenCalled();
		expect(addBoardViewMock).not.toHaveBeenCalled();
		expect(registerActionsMock).not.toHaveBeenCalled();
		expect(upsertAppMock).not.toHaveBeenCalled();
	});
});
