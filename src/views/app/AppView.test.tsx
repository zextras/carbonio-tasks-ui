/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, screen, waitFor } from '@testing-library/react';
import { startOfToday } from 'date-fns';
import { graphql } from 'msw';
import { BrowserRouter } from 'react-router-dom';

import AppView from './AppView';
import { RANDOM_PLACEHOLDER_TIMEOUT } from '../../constants';
import { EMPTY_DISPLAYER_HINT } from '../../constants/tests';
import {
	type FindTasksQuery,
	type FindTasksQueryVariables,
	type GetTaskQuery,
	type GetTaskQueryVariables
} from '../../gql/types';
import server from '../../mocks/server';
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

	function showDisplayerPlaceholder(): void {
		act(() => {
			jest.advanceTimersByTime(RANDOM_PLACEHOLDER_TIMEOUT);
		});
	}

	test('Show tasks view', async () => {
		const tasks = populateTaskList();
		tasks.forEach((task) => {
			// reset reminder to avoid the opening of the reminders modal
			// eslint-disable-next-line no-param-reassign
			task.reminderAt = null;
		});
		const findTasksRequest = jest.fn();
		server.use(
			graphql.query<FindTasksQuery, FindTasksQueryVariables>('findTasks', (req, res, ctx) => {
				findTasksRequest();
				return res(
					ctx.data({
						findTasks: tasks
					})
				);
			})
		);

		setup(<AppView />, { renderOptions: { wrapper: AppWrapper } });
		await screen.findByText(/all tasks/i);
		await waitFor(() => expect(findTasksRequest).toHaveBeenCalled());
		showDisplayerPlaceholder();
		makeListItemsVisible();
		expect(screen.getByText(/all tasks/i)).toBeVisible();
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		expect(screen.getByText(tasks[0].title)).toBeVisible();
		expect(screen.getByText(tasks[tasks.length - 1].title)).toBeVisible();
		// wait for reminders manager lazy query to run
		await waitFor(
			() =>
				new Promise((resolve) => {
					setTimeout(resolve, 0);
				})
		);
	});

	test('Open displayer on click on an item', async () => {
		const tasks = populateTaskList();
		tasks.forEach((task) => {
			// reset reminder to avoid the opening of the reminders modal
			// eslint-disable-next-line no-param-reassign
			task.reminderAt = null;
		});
		const task = tasks[tasks.length - 1];
		const findTasksRequest = jest.fn();
		server.use(
			graphql.query<FindTasksQuery, FindTasksQueryVariables>('findTasks', (req, res, ctx) => {
				findTasksRequest();
				return res(
					ctx.data({
						findTasks: tasks
					})
				);
			}),
			graphql.query<GetTaskQuery, GetTaskQueryVariables>('getTask', (req, res, ctx) => {
				const { taskId } = req.variables;
				const taskResult = tasks.find((item) => item.id === taskId);
				return res(ctx.data({ getTask: taskResult || null }));
			})
		);
		// remove wrapper so that the appView wrapper are used
		const { user } = setup(<AppView />, { renderOptions: { wrapper: AppWrapper } });
		await waitFor(() => expect(findTasksRequest).toHaveBeenCalled());
		showDisplayerPlaceholder();
		makeListItemsVisible();
		expect(screen.getByText(/all tasks/i)).toBeVisible();
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		expect(screen.getByText(task.title)).toBeVisible();
		await user.click(screen.getByText(task.title));
		await screen.findByText(/creation date/i);
		expect(screen.queryByText(EMPTY_DISPLAYER_HINT)).not.toBeInTheDocument();
		expect(screen.getAllByText(task.title)).toHaveLength(2);
	});

	describe('Reminders', () => {
		test('Show modal of reminders on load if there is at least one reminder to show', async () => {
			const tasks = populateTaskList();
			tasks[0].reminderAt = faker.date.between(startOfToday(), Date.now()).getTime();
			const findTasksRequest = jest.fn();
			server.use(
				graphql.query<FindTasksQuery, FindTasksQueryVariables>('findTasks', (req, res, ctx) => {
					findTasksRequest();
					return res(
						ctx.data({
							findTasks: tasks
						})
					);
				})
			);

			setup(<AppView />, {
				renderOptions: { wrapper: AppWrapper }
			});

			await waitFor(() => expect(findTasksRequest).toHaveBeenCalled());
			await screen.findByText(/tasks reminders/i);
			expect(screen.getByText(tasks[0].title)).toBeVisible();
		});

		test.todo(
			'When a reminder is completed from the reminders modal, remove the item from the list'
		);

		test.todo(
			'When a reminder is completed and restored from the reminders modal, leave the item in the list in the same position'
		);

		test.todo(
			'When a reminder is completed from the reminders modal, close the displayer if opened on the item'
		);

		test.todo(
			'When a reminder is completed from the reminders modal, does not close the displayer if opened on another item'
		);

		test.todo(
			'When a reminder is completed and restored from the reminders modal, leave the displayer open if opened on the item'
		);
	});
});
