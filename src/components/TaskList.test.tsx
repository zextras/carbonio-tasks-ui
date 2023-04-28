/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { TaskList } from './TaskList';
import { EMPTY_LIST_HINT } from '../constants/tests';
import { populateTaskList } from '../mocks/utils';
import { makeListItemsVisible, setup } from '../utils/testUtils';

describe('Task list', () => {
	test('Show a placeholder when the list is empty', async () => {
		setup(<TaskList tasks={[]} />);
		expect(screen.getByText(/all tasks/i)).toBeVisible();
		await screen.findByText(EMPTY_LIST_HINT);
		expect(screen.getByText(EMPTY_LIST_HINT)).toBeVisible();
	});

	test('Show list items if the list is not empty', async () => {
		const tasks = populateTaskList();
		setup(<TaskList tasks={tasks} />);

		expect(screen.queryByText(tasks[0].title)).not.toBeInTheDocument();
		expect(screen.queryByText(tasks[1].title)).not.toBeInTheDocument();
		expect(screen.queryByText(tasks[2].title)).not.toBeInTheDocument();

		makeListItemsVisible();

		expect(screen.getByText(tasks[0].title)).toBeVisible();
		expect(screen.getByText(tasks[1].title)).toBeVisible();
		expect(screen.getByText(tasks[2].title)).toBeVisible();
	});
});
