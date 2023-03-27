/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import { startOfToday } from 'date-fns';
import { graphql } from 'msw';

import AppView from './AppView';
import { RANDOM_PLACEHOLDER_TIMEOUT } from '../../constants';
import { EMPTY_DISPLAYER_HINT, ICON_REGEXP, TEST_ID_SELECTOR } from '../../constants/tests';
import {
	type FindTasksQuery,
	type FindTasksQueryVariables,
	type GetTaskQuery,
	type GetTaskQueryVariables
} from '../../gql/types';
import server from '../../mocks/server';
import { populateTask, populateTaskList } from '../../mocks/utils';
import { makeListItemsVisible, setup } from '../../utils/testUtils';

describe('App view', () => {
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

		setup(<AppView />);
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
		const { user } = setup(<AppView />);
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

	test('List item is highlighted when and only when it is opened in the displayer', async () => {
		const task = populateTask({ reminderAt: null });
		const findTasksRequest = jest.fn();
		server.use(
			graphql.query<FindTasksQuery, FindTasksQueryVariables>('findTasks', (req, res, ctx) => {
				findTasksRequest();
				return res(ctx.data({ findTasks: [task] }));
			})
		);
		const { getByRoleWithIcon, user } = setup(<AppView />, {
			initialRouterEntries: [`/${task.id}`]
		});
		await waitFor(() => expect(findTasksRequest).toHaveBeenCalled());
		makeListItemsVisible();
		await waitFor(() => expect(screen.getAllByText(task.title)).toHaveLength(2));
		expect(screen.getByTestId(TEST_ID_SELECTOR.listItem)).toHaveStyleRule('background', '#d5e3f6');
		await user.click(getByRoleWithIcon('button', { icon: ICON_REGEXP.closeDisplayer }));
		expect(screen.getByTestId(TEST_ID_SELECTOR.listItem)).toHaveStyleRule('background', '#ffffff');
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

			setup(<AppView />);

			await waitFor(() => expect(findTasksRequest).toHaveBeenCalled());
			await screen.findByText(/tasks reminders/i);
			expect(screen.getByText(tasks[0].title)).toBeVisible();
		});

		test('When a reminder is completed from the reminders modal, remove the item from the list when the modal is closed with dismiss button', async () => {
			const tasks = populateTaskList();
			tasks.forEach((task) => {
				// disable reminder for all tasks
				// eslint-disable-next-line no-param-reassign
				task.reminderAt = null;
			});
			// set reminder only for one item
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

			const { getByRoleWithIcon, user } = setup(<AppView />);

			await waitFor(() => expect(findTasksRequest).toHaveBeenCalled());
			await screen.findByText(/tasks reminders/i);
			makeListItemsVisible();
			expect(screen.getAllByText(tasks[0].title)).toHaveLength(2);
			await user.click(getByRoleWithIcon('button', { icon: ICON_REGEXP.reminderCompleteAction }));
			await screen.findByTestId(ICON_REGEXP.reminderComplete);
			await user.click(screen.getByRole('button', { name: /dismiss/i }));
			expect(screen.queryByText(tasks[0].title)).not.toBeInTheDocument();
		});

		test('When a reminder is completed and restored from the reminders modal, leave the item in the list in the same position', async () => {
			const tasks = populateTaskList();
			tasks.forEach((task) => {
				// disable reminder for all tasks
				// eslint-disable-next-line no-param-reassign
				task.reminderAt = null;
			});
			// set reminder only for one item
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

			const { getByRoleWithIcon, user } = setup(<AppView />);

			await waitFor(() => expect(findTasksRequest).toHaveBeenCalled());
			await screen.findByText(/tasks reminders/i);
			makeListItemsVisible();
			expect(screen.getAllByText(tasks[0].title)).toHaveLength(2);
			await user.click(getByRoleWithIcon('button', { icon: ICON_REGEXP.reminderCompleteAction }));
			await screen.findByTestId(ICON_REGEXP.reminderComplete);
			await user.click(getByRoleWithIcon('button', { icon: ICON_REGEXP.reminderUndoAction }));
			await waitForElementToBeRemoved(screen.queryByTestId(ICON_REGEXP.reminderComplete));
			await user.click(screen.getByRole('button', { name: /dismiss/i }));
			expect(screen.getByText(tasks[0].title)).toBeVisible();
			expect(
				within(screen.getAllByTestId(TEST_ID_SELECTOR.listItemContent)[0]).getByText(tasks[0].title)
			).toBeVisible();
		});

		test('When a reminder is completed from the reminders modal, close the displayer if opened on the item', async () => {
			const tasks = populateTaskList();
			tasks.forEach((task) => {
				// disable reminder for all tasks
				// eslint-disable-next-line no-param-reassign
				task.reminderAt = null;
			});
			// set reminder only for one item
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

			const { getByRoleWithIcon, user } = setup(<AppView />, {
				initialRouterEntries: [`/${tasks[0].id}`]
			});

			await waitFor(() => expect(findTasksRequest).toHaveBeenCalled());
			await screen.findByText(/tasks reminders/i);
			makeListItemsVisible();
			await screen.findByText(/creation date/i);
			expect(screen.getAllByText(tasks[0].title)).toHaveLength(3);
			await user.click(getByRoleWithIcon('button', { icon: ICON_REGEXP.reminderCompleteAction }));
			await screen.findByTestId(ICON_REGEXP.reminderComplete);
			await user.click(screen.getByRole('button', { name: /dismiss/i }));
			showDisplayerPlaceholder();
			expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
			expect(screen.queryByText(tasks[0].title)).not.toBeInTheDocument();
		});

		test('When a reminder is completed from the reminders modal, does not close the displayer if opened on another item', async () => {
			const tasks = populateTaskList();
			tasks.forEach((task) => {
				// disable reminder for all tasks
				// eslint-disable-next-line no-param-reassign
				task.reminderAt = null;
			});
			// set reminder only for one item
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

			const { getByRoleWithIcon, user } = setup(<AppView />, {
				initialRouterEntries: [`/${tasks[1].id}`]
			});

			await waitFor(() => expect(findTasksRequest).toHaveBeenCalled());
			await screen.findByText(/tasks reminders/i);
			makeListItemsVisible();
			await screen.findByText(/creation date/i);
			expect(screen.getAllByText(tasks[0].title)).toHaveLength(2);
			expect(screen.getAllByText(tasks[1].title)).toHaveLength(2);
			await user.click(getByRoleWithIcon('button', { icon: ICON_REGEXP.reminderCompleteAction }));
			await screen.findByTestId(ICON_REGEXP.reminderComplete);
			await user.click(screen.getByRole('button', { name: /dismiss/i }));
			showDisplayerPlaceholder();
			expect(screen.queryByText(EMPTY_DISPLAYER_HINT)).not.toBeInTheDocument();
			expect(screen.getByText(/creation date/i)).toBeVisible();
			expect(screen.getAllByText(tasks[1].title)).toHaveLength(2);
		});

		test('When a reminder is completed and restored from the reminders modal, leave the displayer open if opened on the item', async () => {
			const tasks = populateTaskList();
			tasks.forEach((task) => {
				// disable reminder for all tasks
				// eslint-disable-next-line no-param-reassign
				task.reminderAt = null;
			});
			// set reminder only for one item
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

			const { getByRoleWithIcon, user } = setup(<AppView />, {
				initialRouterEntries: [`/${tasks[0].id}`]
			});

			await waitFor(() => expect(findTasksRequest).toHaveBeenCalled());
			await screen.findByText(/tasks reminders/i);
			makeListItemsVisible();
			await screen.findByText(/creation date/i);
			expect(screen.getAllByText(tasks[0].title)).toHaveLength(3);
			await user.click(getByRoleWithIcon('button', { icon: ICON_REGEXP.reminderCompleteAction }));
			await screen.findByTestId(ICON_REGEXP.reminderComplete);
			await user.click(getByRoleWithIcon('button', { icon: ICON_REGEXP.reminderUndoAction }));
			await waitForElementToBeRemoved(screen.queryByTestId(ICON_REGEXP.reminderComplete));
			await user.click(screen.getByRole('button', { name: /dismiss/i }));
			showDisplayerPlaceholder();
			expect(screen.queryByText(EMPTY_DISPLAYER_HINT)).not.toBeInTheDocument();
			expect(screen.getAllByText(tasks[0].title)).toHaveLength(2);
			expect(screen.getByText(/creation date/i)).toBeVisible();
		});
	});
});
