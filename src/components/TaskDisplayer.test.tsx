/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { screen } from '@testing-library/react';

import { TaskDisplayer } from './TaskDisplayer';
import { TIMEZONE_DEFAULT } from '../constants';
import { ICON_REGEXP } from '../constants/tests';
import { populateTask } from '../mocks/utils';
import { formatDateFromTimestamp } from '../utils';
import { setup } from '../utils/testUtils';

describe('Task displayer', () => {
	test('Show all task information', () => {
		const task = populateTask();
		task.reminderAt = faker.datatype.datetime().getTime();
		task.description = faker.lorem.sentences();

		setup(<TaskDisplayer task={task} />);
		expect(screen.getByText(task.title)).toBeVisible();
		expect(screen.getByText(/creation date/i)).toBeVisible();
		expect(
			screen.getByText(
				formatDateFromTimestamp(task.createdAt, { timezone: TIMEZONE_DEFAULT, includeTime: false })
			)
		).toBeVisible();
		expect(screen.getByText(/reminder/i)).toBeVisible();
		expect(
			screen.getByText(
				formatDateFromTimestamp(task.reminderAt, {
					timezone: TIMEZONE_DEFAULT,
					includeTime: task.reminderAllDay !== true
				})
			)
		).toBeVisible();
		expect(screen.getByText(/description/i)).toBeVisible();
		expect(screen.getByText(task.description)).toBeVisible();
	});

	test('Show close action', () => {
		const task = populateTask();

		const { getByRoleWithIcon } = setup(<TaskDisplayer task={task} />);
		expect(getByRoleWithIcon('button', { icon: ICON_REGEXP.close })).toBeVisible();
		expect(getByRoleWithIcon('button', { icon: ICON_REGEXP.close })).toBeEnabled();
	});

	describe('Actions', () => {
		describe('Complete', () => {
			test('Is visible and enabled', () => {
				const task = populateTask();
				const { getByRoleWithIcon } = setup(<TaskDisplayer task={task} />);
				expect(
					getByRoleWithIcon('button', { name: /complete/i, icon: ICON_REGEXP.completeAction })
				).toBeVisible();
				expect(
					getByRoleWithIcon('button', { name: /complete/i, icon: ICON_REGEXP.completeAction })
				).toBeEnabled();
			});
		});

		describe('Edit', () => {
			test('Is visible and enabled', () => {
				const task = populateTask();
				const { getByRoleWithIcon } = setup(<TaskDisplayer task={task} />);
				expect(
					getByRoleWithIcon('button', { name: /edit/i, icon: ICON_REGEXP.editAction })
				).toBeVisible();
				expect(
					getByRoleWithIcon('button', { name: /edit/i, icon: ICON_REGEXP.editAction })
				).toBeEnabled();
			});
		});
	});
});
