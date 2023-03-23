/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';

import EditTaskBoard from './EditTaskBoard';
import { ICON_REGEXP } from '../../constants/tests';
import { Priority, type Task, type UpdateTaskInput } from '../../gql/types';
import { mockGetTask, mockUpdateTask, populateTask } from '../../mocks/utils';
import { setup } from '../../utils/testUtils';

describe('Edit task board', () => {
	test('Show fields for title, priority, reminder toggle and description and edit button', async () => {
		const task = populateTask({ reminderAt: null, reminderAllDay: null });
		jest.spyOn(shell, 'useBoard').mockReturnValue({
			context: { taskId: task.id },
			id: '',
			url: '',
			app: '',
			icon: '',
			title: ''
		});

		const getTaskMock = mockGetTask({ taskId: task.id }, task);

		const mocks = [getTaskMock];

		setup(<EditTaskBoard />, { mocks });
		const detailsLabel = await screen.findByText(/details/i);
		expect(detailsLabel).toBeVisible();
		expect(screen.getByRole('textbox', { name: /title/i })).toBeVisible();
		expect(screen.getByText(/priority/i)).toBeVisible();
		expect(screen.getByText(/enable reminder/i)).toBeVisible();
		expect(screen.getByTestId(ICON_REGEXP.switchOff)).toBeVisible();
		expect(screen.getByText('Description')).toBeVisible();
		expect(screen.getByRole('textbox', { name: /task description/i })).toBeVisible();
		expect(screen.getByRole('button', { name: /edit/i })).toBeVisible();
	});

	describe('Title', () => {
		test('When cleared the edit button is disabled', async () => {
			const task = populateTask({ reminderAt: null, reminderAllDay: null });
			jest.spyOn(shell, 'useBoard').mockReturnValue({
				context: { taskId: task.id },
				id: '',
				url: '',
				app: '',
				icon: '',
				title: ''
			});

			const getTaskMock = mockGetTask({ taskId: task.id }, task);
			const mocks = [getTaskMock];
			const { user } = setup(<EditTaskBoard />, { mocks });
			await screen.findByText(/details/i);
			expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue(task.title);
			await user.clear(screen.getByRole('textbox', { name: /title/i }));
			expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled();
		});
	});

	describe('Priority', () => {
		test('The previous priority is shown', async () => {
			const task = populateTask({ priority: Priority.High });
			jest.spyOn(shell, 'useBoard').mockReturnValue({
				context: { taskId: task.id },
				id: '',
				url: '',
				app: '',
				icon: '',
				title: ''
			});

			const getTaskMock = mockGetTask({ taskId: task.id }, task);

			const mocks = [getTaskMock];

			setup(<EditTaskBoard />, { mocks });
			const detailsLabel = await screen.findByText(/details/i);
			expect(detailsLabel).toBeVisible();

			expect(screen.getByText(/priority/i)).toBeVisible();
			expect(screen.getByText(/high/i)).toBeVisible();
			expect(screen.getByTestId(ICON_REGEXP.highPriority)).toBeVisible();
			expect(screen.queryByTestId(ICON_REGEXP.mediumPriority)).not.toBeInTheDocument();
			expect(screen.queryByTestId(ICON_REGEXP.lowPriority)).not.toBeInTheDocument();
		});

		test('Edit a task to have low priority', async () => {
			const task = populateTask({ priority: Priority.High, reminderAt: null });
			jest.spyOn(shell, 'useBoard').mockReturnValue({
				context: { taskId: task.id },
				id: '',
				url: '',
				app: '',
				icon: '',
				title: ''
			});

			const getTaskMock = mockGetTask({ taskId: task.id }, task);

			const updateTaskInput: UpdateTaskInput = {
				id: task.id,
				priority: Priority.Low
			};

			const updateTaskResult: Task = {
				__typename: 'Task',
				...task,
				priority: updateTaskInput.priority || Priority.Low
			};

			const updateTaskMock = mockUpdateTask(updateTaskInput, updateTaskResult);
			const mocks = [getTaskMock, updateTaskMock];

			const { user, rerender } = setup(<EditTaskBoard />, { mocks });
			await screen.findByText(/details/i);

			const prioritySelect = screen.getByText('Priority');
			await user.click(prioritySelect);

			const lowPriority = screen.getByText('Low');
			await user.click(lowPriority);

			const createButton = screen.getByRole('button', { name: /edit/i });
			await user.click(createButton);
			expect(updateTaskMock.result).toHaveBeenCalledWith();
			rerender(<EditTaskBoard />);

			const low = await screen.findByText(/low/i);
			expect(low).toBeVisible();
			expect(screen.queryByTestId(ICON_REGEXP.lowPriority)).toBeVisible();
		});
	});
});
