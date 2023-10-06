/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { EmptyDisplayer } from './EmptyDisplayer';
import { ListContext } from '../contexts';
import { setup } from '../utils/testUtils';

describe('Empty displayer', () => {
	test('Show suggestion', async () => {
		setup(<EmptyDisplayer translationKey={'translation.key'} />);
		await screen.findByText(/start organizing your day/i);
		expect(screen.getByText(/start organizing your day/i)).toBeVisible();
		expect(screen.getByText(/click the "new" button to create a task/i)).toBeVisible();
	});

	test('Show hint for limit of task when limit is reached', async () => {
		setup(
			<ListContext.Provider value={{ isFull: true }}>
				<EmptyDisplayer translationKey={'translation.key'} />
			</ListContext.Provider>
		);
		await screen.findByText(/you have reached the maximum number of tasks/i);
		expect(screen.getByText(/you have reached the maximum number of tasks/i)).toBeVisible();
		expect(screen.getByText(/Delete your previous tasks to create more/i)).toBeVisible();
	});
});
