/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { screen, waitFor } from '@testing-library/react';
import gql from 'graphql-tag';
import { Route } from 'react-router-dom';

import { Displayer } from './Displayer';
import { ROUTES, TIMEZONE_DEFAULT } from '../constants';
import { EMPTY_DISPLAYER_HINT, ICON_REGEXP } from '../constants/tests';
import { type Task } from '../gql/types';
import { mockGetTask, populateTask } from '../mocks/utils';
import { formatDateFromTimestamp } from '../utils';
import { setup } from '../utils/testUtils';

describe('Displayer', () => {
	const TASK_FULL_DATA = gql`
		fragment TaskFullData on Task {
			id
			title
			description
			status
			createdAt
			priority
			reminderAt
			reminderAllDay
		}
	`;
	const TASK_PARTIAL_DATA = gql`
		fragment TaskPartialData on Task {
			id
			title
			# do not write description in cache
			# description
			status
			createdAt
			priority
			reminderAt
			reminderAllDay
		}
	`;
	test('Show suggestions if no task is active', async () => {
		const { queryByRoleWithIcon } = setup(<Displayer translationKey={'translation.key'} />);
		await screen.findByText(EMPTY_DISPLAYER_HINT);
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		expect(screen.queryByText(/creation date/i)).not.toBeInTheDocument();
		expect(
			queryByRoleWithIcon('button', { icon: ICON_REGEXP.closeDisplayer })
		).not.toBeInTheDocument();
	});

	test('Show task details if a task is active', async () => {
		const task = populateTask();
		const mocks = [mockGetTask({ taskId: task.id }, task)];
		const { getByRoleWithIcon } = setup(
			<Route path={ROUTES.task}>
				<Displayer translationKey={'translation.key'} />
			</Route>,
			{
				initialRouterEntries: [`/${task.id}`],
				mocks
			}
		);
		await screen.findByText(task.title);
		expect(screen.getByText(task.title)).toBeVisible();
		expect(getByRoleWithIcon('button', { icon: ICON_REGEXP.closeDisplayer })).toBeVisible();
		expect(
			screen.getByText(
				formatDateFromTimestamp(task.createdAt, { timezone: TIMEZONE_DEFAULT, includeTime: false })
			)
		).toBeVisible();
		expect(screen.getByText(RegExp(task.priority, 'i'))).toBeVisible();
		expect(screen.queryByText(EMPTY_DISPLAYER_HINT)).not.toBeInTheDocument();
	});

	test('Load task data from cache if all fields are already loaded', async () => {
		const task = populateTask();
		// write all fields inside cache
		global.apolloClient.writeFragment<Task>({
			id: global.apolloClient.cache.identify(task),
			fragment: TASK_FULL_DATA,
			data: task
		});
		const getTaskMock = mockGetTask({ taskId: task.id }, task);
		const mocks = [getTaskMock];
		setup(
			<Route path={ROUTES.task}>
				<Displayer translationKey={'translation.key'} />
			</Route>,
			{ initialRouterEntries: [`/${task.id}`], mocks }
		);
		await screen.findByText(task.title);
		expect(screen.getByText(task.title)).toBeVisible();
		expect(screen.getByText(RegExp(task.priority, 'i'))).toBeVisible();
		expect(getTaskMock.result).not.toHaveBeenCalled();
	});

	test('Make network request if some field is not cached', async () => {
		const task = populateTask();
		task.description = faker.lorem.sentences();
		// write all fields but one (description) inside cache
		global.apolloClient.writeFragment<Task>({
			id: global.apolloClient.cache.identify(task),
			fragment: TASK_PARTIAL_DATA,
			data: task
		});
		const getTaskMock = mockGetTask({ taskId: task.id }, task);
		const mocks = [getTaskMock];
		setup(
			<Route path={ROUTES.task}>
				<Displayer translationKey={'translation.key'} />
			</Route>,
			{ initialRouterEntries: [`/${task.id}`], mocks }
		);
		await screen.findByText(task.title);
		expect(screen.getByText(task.title)).toBeVisible();
		expect(screen.getByText(RegExp(task.priority, 'i'))).toBeVisible();
		await screen.findByText(/description/i);
		expect(screen.getByText(task.description)).toBeVisible();
		expect(getTaskMock.result).toHaveBeenCalled();
	});

	test('Show task with partial data if request to load all data fails but some fields are cached', async () => {
		const task = populateTask();
		task.description = faker.lorem.sentences();
		// write all fields but one (description) inside cache
		global.apolloClient.writeFragment<Task>({
			id: global.apolloClient.cache.identify(task),
			fragment: TASK_PARTIAL_DATA,
			data: task
		});
		const getTaskMock = mockGetTask(
			{ taskId: task.id },
			null,
			new Error('Controlled error: getTask')
		);
		const mocks = [getTaskMock];
		setup(
			<Route path={ROUTES.task}>
				<Displayer translationKey={'translation.key'} />
			</Route>,
			{ initialRouterEntries: [`/${task.id}`], mocks }
		);
		await screen.findByText(task.title);
		expect(screen.getByText(task.title)).toBeVisible();
		expect(screen.getByText(RegExp(task.priority, 'i'))).toBeVisible();
		expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
		// wait for query to run
		await waitFor(
			() =>
				new Promise((resolve) => {
					setTimeout(resolve, 0);
				})
		);
		// partial data are still visible
		expect(screen.getByText(task.title)).toBeVisible();
		expect(screen.getByText(RegExp(task.priority, 'i'))).toBeVisible();
		// description is still not visible
		expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
		expect(screen.queryByText(task.description)).not.toBeInTheDocument();
	});
});
