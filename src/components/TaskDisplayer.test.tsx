/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { screen } from '@testing-library/react';

import { TaskDisplayer } from './TaskDisplayer';
import { ICON_REGEXP } from '../constants/tests';
import { Status } from '../gql/types';
import { populateTask } from '../mocks/utils';
import { formatDateFromTimestamp } from '../utils';
import { setup } from '../utils/testUtils';

describe('Task displayer', () => {
	test('Show all task information', () => {
		const task = populateTask();
		task.reminderAt = faker.date.anytime().getTime();
		task.description = faker.lorem.sentences();

		setup(<TaskDisplayer task={task} />);
		expect(screen.getByText(task.title)).toBeVisible();
		expect(screen.getByText(/creation date/i)).toBeVisible();
		expect(
			screen.getByText(formatDateFromTimestamp(task.createdAt, { includeTime: false }))
		).toBeVisible();
		expect(screen.getByText(/reminder/i)).toBeVisible();
		expect(
			screen.getByText(
				formatDateFromTimestamp(task.reminderAt, {
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
		expect(getByRoleWithIcon('button', { icon: ICON_REGEXP.closeDisplayer })).toBeVisible();
		expect(getByRoleWithIcon('button', { icon: ICON_REGEXP.closeDisplayer })).toBeEnabled();
	});

	describe('Actions', () => {
		describe('Complete', () => {
			test.each([
				[Status.Open, 'visible and enabled'],
				[Status.Complete, 'not present in the document']
			])('When task is %s, complete action is %s', (status) => {
				const task = populateTask({ status });
				setup(<TaskDisplayer task={task} />);
				if (status === Status.Open) {
					expect(screen.getByRole('button', { name: /^complete/i })).toBeVisible();
					expect(screen.getByRole('button', { name: /^complete/i })).toBeEnabled();
				} else if (status === Status.Complete) {
					expect(screen.queryByRole('button', { name: /^complete/i })).not.toBeInTheDocument();
				}
			});
		});

		describe('Uncomplete', () => {
			test.each([
				[Status.Complete, 'visible and enabled'],
				[Status.Open, 'not present in the document']
			])('When task is %s, uncomplete action is %s', (status) => {
				const task = populateTask({ status });
				setup(<TaskDisplayer task={task} />);
				if (status === Status.Complete) {
					expect(screen.getByRole('button', { name: /^uncomplete/i })).toBeVisible();
					expect(screen.getByRole('button', { name: /^uncomplete/i })).toBeEnabled();
				} else if (status === Status.Open) {
					expect(screen.queryByRole('button', { name: /^uncomplete/i })).not.toBeInTheDocument();
				}
			});
		});

		describe('Edit', () => {
			test('Is visible and enabled', () => {
				const task = populateTask();
				setup(<TaskDisplayer task={task} />);
				expect(screen.getByRole('button', { name: /edit/i })).toBeVisible();
				expect(screen.getByRole('button', { name: /edit/i })).toBeEnabled();
			});
		});

		describe('Delete', () => {
			test('Is visible and enabled', () => {
				const task = populateTask();
				setup(<TaskDisplayer task={task} />);
				expect(screen.getByRole('button', { name: /delete/i })).toBeVisible();
				expect(screen.getByRole('button', { name: /delete/i })).toBeEnabled();
			});
		});
	});
});
