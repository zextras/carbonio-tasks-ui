/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { screen } from '@testing-library/react';
import moment from 'moment-timezone';

import { TaskDetails } from './TaskDetails';
import { DATE_FORMAT, DATE_TIME_FORMAT, TIMEZONE_DEFAULT } from '../constants';
import { ICON_REGEXP } from '../constants/tests';
import { Priority } from '../gql/types';
import { populateTask } from '../mocks/utils';
import { setup } from '../utils/testUtils';

describe('Task details', () => {
	test('Show creation date without time', () => {
		const task = populateTask();
		setup(<TaskDetails createdAt={task.createdAt} priority={task.priority} />);
		expect(screen.getByText(/creation date/i)).toBeVisible();
		expect(
			screen.getByText(moment(task.createdAt).tz(TIMEZONE_DEFAULT).format(DATE_FORMAT))
		).toBeVisible();
		expect(
			screen.queryByText(moment(task.createdAt).tz(TIMEZONE_DEFAULT).format(DATE_TIME_FORMAT))
		).not.toBeInTheDocument();
	});

	test('Show priority', () => {
		const task = populateTask();
		task.priority = Priority.Medium;
		setup(<TaskDetails createdAt={task.createdAt} priority={task.priority} />);
		expect(screen.getByText(/priority/i)).toBeVisible();
		expect(screen.getByText(/medium/i)).toBeVisible();
		expect(screen.getByTestId(ICON_REGEXP.mediumPriority));
	});

	describe('Reminder', () => {
		test('Show date only if set for all day', () => {
			const task = populateTask();
			task.reminderAllDay = true;
			task.reminderAt = faker.datatype.datetime().getTime();
			setup(
				<TaskDetails
					createdAt={task.createdAt}
					priority={task.priority}
					reminderAt={task.reminderAt}
					reminderAllDay={task.reminderAllDay}
				/>
			);
			expect(screen.getByText(/reminder/i)).toBeVisible();
			expect(
				screen.getByText(moment(task.reminderAt).tz(TIMEZONE_DEFAULT).format(DATE_FORMAT))
			).toBeVisible();
			expect(
				screen.queryByText(moment(task.reminderAt).tz(TIMEZONE_DEFAULT).format(DATE_TIME_FORMAT))
			).not.toBeInTheDocument();
		});

		test('Show time if not set for all day', () => {
			const task = populateTask();
			task.reminderAllDay = false;
			task.reminderAt = faker.datatype.datetime().getTime();
			setup(
				<TaskDetails
					createdAt={task.createdAt}
					priority={task.priority}
					reminderAt={task.reminderAt}
					reminderAllDay={task.reminderAllDay}
				/>
			);
			expect(screen.getByText(/reminder/i)).toBeVisible();
			expect(
				screen.getByText(moment(task.reminderAt).tz(TIMEZONE_DEFAULT).format(DATE_TIME_FORMAT))
			).toBeVisible();
		});

		test('Hide field if not set', () => {
			const task = populateTask();
			task.reminderAt = null;
			setup(
				<TaskDetails
					createdAt={task.createdAt}
					priority={task.priority}
					reminderAt={task.reminderAt}
					reminderAllDay={task.reminderAllDay}
				/>
			);
			expect(screen.queryByText(/reminder/i)).not.toBeInTheDocument();
			expect(
				screen.queryByText(moment(task.reminderAt).tz(TIMEZONE_DEFAULT).format(DATE_FORMAT))
			).not.toBeInTheDocument();
		});

		test('Show expired icon if expired', () => {
			const task = populateTask();
			task.reminderAt = faker.date.past().getTime();
			setup(
				<TaskDetails
					createdAt={task.createdAt}
					priority={task.priority}
					reminderAt={task.reminderAt}
					reminderAllDay={task.reminderAllDay}
				/>
			);
			expect(screen.getByText(/reminder/i)).toBeVisible();
			expect(
				screen.getByText(moment(task.reminderAt).tz(TIMEZONE_DEFAULT).format(DATE_FORMAT), {
					exact: false
				})
			).toBeVisible();
			expect(screen.getByTestId(ICON_REGEXP.reminderExpired)).toBeVisible();
		});
	});

	describe('Description', () => {
		test('Show description when set', () => {
			const task = populateTask();
			task.description = faker.lorem.sentences();
			setup(
				<TaskDetails
					createdAt={task.createdAt}
					priority={task.priority}
					description={task.description}
				/>
			);
			expect(screen.getByText(/description/i)).toBeVisible();
			expect(screen.getByText(task.description)).toBeVisible();
		});

		test('Hide field when empty', () => {
			const task = populateTask();
			task.description = '';
			setup(
				<TaskDetails
					createdAt={task.createdAt}
					priority={task.priority}
					description={task.description}
				/>
			);
			expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
		});
	});
});
