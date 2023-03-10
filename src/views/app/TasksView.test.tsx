/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { screen, waitFor } from '@testing-library/react';
import { Route } from 'react-router-dom';

import { TasksView } from './TasksView';
import { ROUTES, TIMEZONE_DEFAULT } from '../../constants';
import { EMPTY_DISPLAYER_HINT, EMPTY_LIST_HINT, ICON_REGEXP } from '../../constants/tests';
import { mockFindTasks, mockGetTask, populateTaskList } from '../../mocks/utils';
import { formatDateFromTimestamp } from '../../utils';
import { makeListItemsVisible, setup } from '../../utils/testUtils';

describe('Task view', () => {
	test('Show the empty list and the empty displayer if there is no task', async () => {
		const findTasksMock = mockFindTasks({}, []);
		const mocks = [findTasksMock];
		setup(
			<Route path={ROUTES.task}>
				<TasksView />
			</Route>,
			{ mocks }
		);
		await waitFor(() => expect(findTasksMock.result).toHaveBeenCalled());
		await screen.findByText(EMPTY_LIST_HINT);
		await screen.findByText(EMPTY_DISPLAYER_HINT);
		expect(screen.getByText(/all tasks/i)).toBeVisible();
		expect(screen.getByText(EMPTY_LIST_HINT)).toBeVisible();
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
	});

	test('Show the task list and the empty displayer', async () => {
		const tasks = populateTaskList();
		const findTasksMock = mockFindTasks({}, tasks);
		const mocks = [findTasksMock];
		setup(
			<Route path={ROUTES.task}>
				<TasksView />
			</Route>,
			{ mocks }
		);
		await waitFor(() => expect(findTasksMock.result).toHaveBeenCalled());
		await makeListItemsVisible();
		await screen.findByText(tasks[0].title);
		await screen.findByText(EMPTY_DISPLAYER_HINT);
		expect(screen.getByText(/all tasks/i)).toBeVisible();
		expect(screen.queryByText(EMPTY_LIST_HINT)).not.toBeInTheDocument();
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		expect(screen.getByText(tasks[0].title)).toBeVisible();
		expect(screen.getByText(tasks[tasks.length - 1].title)).toBeVisible();
	});

	test('Click on a list item open the displayer for that item', async () => {
		const tasks = populateTaskList();
		const task = tasks[0];
		task.reminderAt = faker.datatype.datetime().getTime();
		task.description = faker.lorem.sentences();
		const findTasksMock = mockFindTasks({}, tasks);
		const mocks = [findTasksMock, mockGetTask({ taskId: task.id }, task)];

		const { findByRoleWithIcon, user } = setup(
			<Route path={ROUTES.task}>
				<TasksView />
			</Route>,
			{
				mocks
			}
		);
		await waitFor(() => expect(findTasksMock.result).toHaveBeenCalled());
		await makeListItemsVisible();
		await screen.findByText(task.title);
		await screen.findByText(EMPTY_DISPLAYER_HINT);
		await user.click(screen.getByText(task.title));
		await findByRoleWithIcon('button', { icon: ICON_REGEXP.close });
		expect(screen.getAllByText(task.title)).toHaveLength(2);
		expect(screen.getByText(/creation date/i)).toBeVisible();
		expect(
			screen.getByText(
				formatDateFromTimestamp(task.createdAt, {
					includeTime: false,
					timezone: TIMEZONE_DEFAULT
				})
			)
		).toBeVisible();
		expect(screen.getByText(/description/i)).toBeVisible();
		expect(screen.getByText(task.description)).toBeVisible();
		expect(screen.getByText(/priority/i)).toBeVisible();
		expect(screen.getByText(RegExp(task.priority, 'i'))).toBeVisible();
		expect(screen.getByText(/reminder/i)).toBeVisible();
		expect(
			screen.getAllByText(
				formatDateFromTimestamp(task.reminderAt, {
					includeTime: task.reminderAllDay !== true,
					timezone: TIMEZONE_DEFAULT
				})
			)
		).toHaveLength(2);
	});

	test('Click on close action close the displayer', async () => {
		const tasks = populateTaskList();
		const task = tasks[0];
		task.reminderAt = faker.datatype.datetime().getTime();
		task.description = faker.lorem.sentences();
		const findTasksMock = mockFindTasks({}, tasks);
		const mocks = [findTasksMock, mockGetTask({ taskId: task.id }, task)];

		const { getByRoleWithIcon, queryByRoleWithIcon, user } = setup(
			<Route path={ROUTES.task}>
				<TasksView />
			</Route>,
			{
				mocks,
				initialRouterEntries: [`/${task.id}`]
			}
		);
		await waitFor(() => expect(findTasksMock.result).toHaveBeenCalled());
		await makeListItemsVisible();
		await screen.findAllByText(task.title);
		expect(screen.queryByText(EMPTY_DISPLAYER_HINT)).not.toBeInTheDocument();
		const closeButton = getByRoleWithIcon('button', { icon: ICON_REGEXP.close });
		expect(closeButton).toBeVisible();
		expect(closeButton).toBeEnabled();
		await user.click(closeButton);
		await screen.findByText(EMPTY_DISPLAYER_HINT);
		// title is shown only 1 time, inside the list
		expect(screen.getByText(task.title)).toBeVisible();
		expect(queryByRoleWithIcon('button', { icon: ICON_REGEXP.close })).not.toBeInTheDocument();
	});
});
