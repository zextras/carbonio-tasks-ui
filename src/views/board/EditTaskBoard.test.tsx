/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { screen, waitFor } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';

import EditTaskBoard from './EditTaskBoard';
import { ICON_REGEXP } from '../../constants/tests';
import { Priority, type Task, type UpdateTaskInput } from '../../gql/types';
import { mockGetTask, mockUpdateTask, populateTask } from '../../mocks/utils';
import { setup } from '../../utils/testUtils';

describe('Edit task board', () => {
	const checkboxLabelText = /Remind me at every login throughout the day/i;
	function spyUseBoard(taskId: string): void {
		jest.spyOn(shell, 'useBoard').mockReturnValue({
			context: { taskId },
			id: '',
			url: '',
			app: '',
			icon: '',
			title: ''
		});
	}
	async function awaitEditBoardRender(): Promise<HTMLElement> {
		return screen.findByText(/details/i);
	}

	describe('Title', () => {
		test('The previous title is shown', async () => {
			const task = populateTask({ title: 'previous title' });
			spyUseBoard(task.id);

			const getTaskMock = mockGetTask({ taskId: task.id }, task);
			const mocks = [getTaskMock];
			setup(<EditTaskBoard />, { mocks });
			await awaitEditBoardRender();

			expect(screen.getByRole('textbox', { name: /title/i })).toBeVisible();
			expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue(task.title);
		});

		test('When cleared the edit button is disabled', async () => {
			const task = populateTask();
			spyUseBoard(task.id);

			const getTaskMock = mockGetTask({ taskId: task.id }, task);
			const mocks = [getTaskMock];
			const { user } = setup(<EditTaskBoard />, { mocks });
			await awaitEditBoardRender();

			await user.clear(screen.getByRole('textbox', { name: /title/i }));
			expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled();
		});
	});

	describe('Priority', () => {
		test('The previous priority is shown', async () => {
			const task = populateTask({ priority: Priority.High });
			spyUseBoard(task.id);

			const getTaskMock = mockGetTask({ taskId: task.id }, task);
			const mocks = [getTaskMock];
			setup(<EditTaskBoard />, { mocks });
			await awaitEditBoardRender();

			expect(screen.getByText(/priority/i)).toBeVisible();
			expect(screen.getByText(/high/i)).toBeVisible();
			expect(screen.getByTestId(ICON_REGEXP.highPriority)).toBeVisible();
			expect(screen.queryByTestId(ICON_REGEXP.mediumPriority)).not.toBeInTheDocument();
			expect(screen.queryByTestId(ICON_REGEXP.lowPriority)).not.toBeInTheDocument();
		});

		test('Edit a task to have low priority', async () => {
			const task = populateTask({ priority: Priority.High, reminderAt: null });
			spyUseBoard(task.id);

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
			await awaitEditBoardRender();

			const prioritySelect = screen.getByText('Priority');
			await user.click(prioritySelect);

			const lowPriority = screen.getByText('Low');
			await user.click(lowPriority);

			const editButton = screen.getByRole('button', { name: /edit/i });
			await user.click(editButton);
			expect(updateTaskMock.result).toHaveBeenCalledWith();
			rerender(<EditTaskBoard />);

			const low = await screen.findByText(/low/i);
			expect(low).toBeVisible();
			expect(screen.queryByTestId(ICON_REGEXP.lowPriority)).toBeVisible();
		});
	});

	describe('Description', () => {
		test('The previous description is shown', async () => {
			const task = populateTask({ description: 'previous description' });
			spyUseBoard(task.id);

			const getTaskMock = mockGetTask({ taskId: task.id }, task);
			const mocks = [getTaskMock];
			setup(<EditTaskBoard />, { mocks });
			await awaitEditBoardRender();

			expect(screen.getByRole('textbox', { name: /description/i })).toBeVisible();
			expect(screen.getByRole('textbox', { name: /description/i })).toHaveValue(task.description);
		});

		test('Is optional, if not set the edit button is enabled', async () => {
			const task = populateTask({ description: 'previous description' });
			spyUseBoard(task.id);

			const getTaskMock = mockGetTask({ taskId: task.id }, task);
			const mocks = [getTaskMock];
			const { user } = setup(<EditTaskBoard />, { mocks });
			await awaitEditBoardRender();

			const editButton = screen.getByRole('button', { name: /edit/i });
			const descriptionInput = screen.getByRole('textbox', { name: /description/i });
			await user.clear(descriptionInput);
			expect(editButton).toBeEnabled();
		});

		test('When the limit of 4096 characters is reached the edit button is disabled and the error description appears', async () => {
			const task = populateTask({ description: null });
			spyUseBoard(task.id);

			const getTaskMock = mockGetTask({ taskId: task.id }, task);
			const mocks = [getTaskMock];
			const { user } = setup(<EditTaskBoard />, { mocks });
			await awaitEditBoardRender();

			const editButton = screen.getByRole('button', { name: /edit/i });
			const descriptionInput = screen.getByRole('textbox', { name: /description/i });
			const maxLengthDescription = faker.random.alpha({ count: 4096 });
			await user.type(descriptionInput, maxLengthDescription);
			expect(descriptionInput).toHaveValue(maxLengthDescription);
			expect(editButton).toBeEnabled();
			expect(
				screen.queryByText(/Maximum length allowed is 4096 characters/i)
			).not.toBeInTheDocument();
			// type a character to exceed the limit
			await user.type(descriptionInput, 'a');
			await waitFor(() => expect(editButton).toBeDisabled());
			expect(screen.getByText(/Maximum length allowed is 4096 characters/i)).toBeVisible();
		});
	});

	describe('Reminder', () => {
		test('If the task has not a reminder than the edit board appears without the reminder fields', async () => {
			const task = populateTask({ reminderAt: null, reminderAllDay: null });
			spyUseBoard(task.id);

			const getTaskMock = mockGetTask({ taskId: task.id }, task);
			const mocks = [getTaskMock];
			setup(<EditTaskBoard />, { mocks });
			await awaitEditBoardRender();

			const switchOffIcon = screen.getByTestId(ICON_REGEXP.switchOff);
			expect(switchOffIcon).toBeVisible();
			expect(screen.queryByTestId(ICON_REGEXP.switchOn)).not.toBeInTheDocument();

			expect(screen.queryByText(checkboxLabelText)).not.toBeInTheDocument();
			expect(screen.queryByRole('textbox', { name: /Reminder/i })).not.toBeInTheDocument();
		});

		test('If the task has a reminder than the edit board appears with the reminder fields', async () => {
			const task = populateTask({ reminderAt: new Date().getTime(), reminderAllDay: true });
			spyUseBoard(task.id);

			const getTaskMock = mockGetTask({ taskId: task.id }, task);
			const mocks = [getTaskMock];
			setup(<EditTaskBoard />, { mocks });
			await awaitEditBoardRender();

			const switchOnIcon = screen.getByTestId(ICON_REGEXP.switchOn);
			expect(switchOnIcon).toBeVisible();
			expect(screen.queryByTestId(ICON_REGEXP.switchOff)).not.toBeInTheDocument();

			expect(screen.getByText(checkboxLabelText)).toBeVisible();
			expect(screen.getByRole('textbox', { name: /Reminder/i })).toBeVisible();
		});
	});
});
