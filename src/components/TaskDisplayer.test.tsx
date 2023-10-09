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
			test('When task is open, complete action is visible and enabled', () => {
				const task = populateTask({ status: Status.Open });
				setup(<TaskDisplayer task={task} />);
				expect(screen.getByRole('button', { name: /^complete/i })).toBeVisible();
				expect(screen.getByRole('button', { name: /^complete/i })).toBeEnabled();
			});
			test('When task is complete, complete action is not present in the document', () => {
				const task = populateTask({ status: Status.Complete });
				setup(<TaskDisplayer task={task} />);
				expect(screen.queryByRole('button', { name: /^complete/i })).not.toBeInTheDocument();
			});
		});

		describe('Uncomplete', () => {
			test('When task is complete, uncomplete action is visible and enabled', () => {
				const task = populateTask({ status: Status.Complete });
				setup(<TaskDisplayer task={task} />);
				expect(screen.getByRole('button', { name: /^uncomplete/i })).toBeVisible();
				expect(screen.getByRole('button', { name: /^uncomplete/i })).toBeEnabled();
			});
			test('When task is open, uncomplete action is not present in the document', () => {
				const task = populateTask({ status: Status.Open });
				setup(<TaskDisplayer task={task} />);
				expect(screen.queryByRole('button', { name: /^uncomplete/i })).not.toBeInTheDocument();
			});
		});

		describe('Edit', () => {
			test('When task is complete, edit action is visible and enabled', () => {
				const task = populateTask({ status: Status.Complete });
				setup(<TaskDisplayer task={task} />);
				expect(screen.getByRole('button', { name: /edit/i })).toBeVisible();
				expect(screen.getByRole('button', { name: /edit/i })).toBeEnabled();
			});
			test('When task is open, edit action is visible and enabled', () => {
				const task = populateTask({ status: Status.Open });
				setup(<TaskDisplayer task={task} />);
				expect(screen.getByRole('button', { name: /edit/i })).toBeVisible();
				expect(screen.getByRole('button', { name: /edit/i })).toBeEnabled();
			});
		});
	});
});
