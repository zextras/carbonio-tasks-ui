/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';
import { type Action } from '@zextras/carbonio-design-system';

import { ActionsHeader } from './ActionsHeader';
import { setup } from '../utils/testUtils';

describe('Actions header', () => {
	test('Show actions', () => {
		const actions: Action[] = [
			{
				id: 'act1',
				label: 'Action 1',
				icon: 'PeopleOutline',
				onClick: jest.fn()
			},
			{
				id: 'act2',
				label: 'Action 2',
				icon: 'ActivityOutline',
				onClick: jest.fn()
			}
		];
		setup(<ActionsHeader actions={actions} />);
		expect(screen.getByRole('button', { name: /action 1/i })).toBeVisible();
		expect(screen.getByRole('button', { name: /action 2/i })).toBeVisible();
	});

	test('Click on an action calls action callback', async () => {
		const actions: Action[] = [
			{
				id: 'act1',
				label: 'Action 1',
				icon: 'PeopleOutline',
				onClick: jest.fn()
			}
		];
		const { user } = setup(<ActionsHeader actions={actions} />);
		const actionButton = screen.getByRole('button');
		expect(actionButton).toBeEnabled();
		await user.click(actionButton);
		expect(actions[0].onClick).toHaveBeenCalled();
		expect(actions[0].onClick).toHaveBeenCalledTimes(1);
	});

	test('Click on a disabled action does not call action callback', async () => {
		const actions: Action[] = [
			{
				id: 'act1',
				label: 'Action 1',
				icon: 'PeopleOutline',
				onClick: jest.fn(),
				disabled: true
			}
		];
		const { user } = setup(<ActionsHeader actions={actions} />);
		const actionButton = screen.getByRole('button');
		expect(actionButton).toBeDisabled();
		await user.click(actionButton);
		expect(actions[0].onClick).not.toHaveBeenCalled();
	});
});
