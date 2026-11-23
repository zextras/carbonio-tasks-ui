/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { screen } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';

import { TaskDisplayer } from './TaskDisplayer';
import { TASK_BOARD_ICON, TASK_DIRTY_BOARD_ICON, TASKS_ROUTE } from '../constants';
import { ICON_REGEXP } from '../constants/tests';
import { Status } from '../gql/types';
import { populateTask } from '../mocks/utils';
import { formatDateFromTimestamp } from '../utils';
import { setup } from '../utils/testUtils';

vi.mock('@zextras/carbonio-shell-ui');

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
			test('Edit action opens the edit board with the task icon and the dirty icon', async () => {
				const addBoardMock = vi.spyOn(shell, 'addBoard');
				const task = populateTask();
				const { user } = setup(<TaskDisplayer task={task} />);

				await user.click(screen.getByRole('button', { name: /edit/i }));

				expect(addBoardMock).toHaveBeenCalledWith(
					expect.objectContaining({
						id: `edit-task-${task.id}`,
						boardViewId: `${TASKS_ROUTE}/edit`,
						icon: TASK_BOARD_ICON,
						dirtyIcon: TASK_DIRTY_BOARD_ICON
					})
				);
			});
		});

		describe('Delete', () => {
			test('When task is complete, delete action is visible and enabled', () => {
				const task = populateTask({ status: Status.Complete });
				setup(<TaskDisplayer task={task} />);
				expect(screen.getByRole('button', { name: /delete/i })).toBeVisible();
				expect(screen.getByRole('button', { name: /delete/i })).toBeEnabled();
			});
			test('When task is open, delete action is visible and enabled', () => {
				const task = populateTask({ status: Status.Open });
				setup(<TaskDisplayer task={task} />);
				expect(screen.getByRole('button', { name: /delete/i })).toBeVisible();
				expect(screen.getByRole('button', { name: /delete/i })).toBeEnabled();
			});
		});
	});
});
