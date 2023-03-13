/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import AppView from './AppView';
import { EMPTY_DISPLAYER_HINT } from '../../constants/tests';
import findTasks from '../../mocks/handlers/findTasks';
import getTask from '../../mocks/handlers/getTask';
import { populateTaskList } from '../../mocks/utils';
import { I18NextTestProvider, makeListItemsVisible, setup } from '../../utils/testUtils';

describe('App view', () => {
	// wrapper used to override wrapper of the setup, so that the real providers are used,
	// plus the router which is missing because it is provided by the shell
	const AppWrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
		<BrowserRouter>
			<I18NextTestProvider>{children}</I18NextTestProvider>
		</BrowserRouter>
	);

	test('Show tasks view', async () => {
		const tasks = populateTaskList();
		findTasks.mockImplementationOnce((req, res, ctx) =>
			res(
				ctx.data({
					findTasks: tasks
				})
			)
		);

		setup(<AppView />, { renderOptions: { wrapper: AppWrapper } });
		await screen.findByText(/all tasks/i);
		await screen.findByText(EMPTY_DISPLAYER_HINT);
		await waitFor(() => expect(findTasks).toHaveBeenCalled());
		makeListItemsVisible();
		expect(screen.getByText(/all tasks/i)).toBeVisible();
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		expect(screen.getByText(tasks[0].title)).toBeVisible();
		expect(screen.getByText(tasks[tasks.length - 1].title)).toBeVisible();
	});

	test('Open displayer on click on an item', async () => {
		const tasks = populateTaskList();
		const task = tasks[tasks.length - 1];
		findTasks.mockImplementationOnce((req, res, ctx) =>
			res(
				ctx.data({
					findTasks: tasks
				})
			)
		);
		getTask.mockImplementationOnce((req, res, ctx) =>
			res(
				ctx.data({
					getTask: task
				})
			)
		);
		// remove wrapper so that the appView wrapper are used
		const { user } = setup(<AppView />, { renderOptions: { wrapper: AppWrapper } });
		await screen.findByText(/all tasks/i);
		await screen.findByText(EMPTY_DISPLAYER_HINT);
		await waitFor(() => expect(findTasks).toHaveBeenCalled());
		makeListItemsVisible();
		expect(screen.getByText(/all tasks/i)).toBeVisible();
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		expect(screen.getByText(task.title)).toBeVisible();
		await user.click(screen.getByText(task.title));
		await screen.findByText(/creation date/i);
		expect(screen.queryByText(EMPTY_DISPLAYER_HINT)).not.toBeInTheDocument();
		expect(screen.getAllByText(task.title)).toHaveLength(2);
	});
});
