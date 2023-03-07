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
import { Priority, Status, type Task } from '../gql/types';
import { setup } from '../utils/testUtils';

describe('Task details', () => {
	test('Show creation date without time', () => {
		const task: Task = {
			id: faker.datatype.uuid(),
			title: faker.random.words(),
			status: Status.Open,
			priority: Priority.Medium,
			createdAt: faker.date.past().getDate()
		};
		setup(<TaskDetails createdAt={task.createdAt} priority={task.priority} />);
		expect(
			screen.getByText(moment(task.createdAt).tz(TIMEZONE_DEFAULT).format(DATE_FORMAT))
		).toBeVisible();
		expect(
			screen.queryByText(moment(task.createdAt).tz(TIMEZONE_DEFAULT).format(DATE_TIME_FORMAT))
		).not.toBeInTheDocument();
	});
});
