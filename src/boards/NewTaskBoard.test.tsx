/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { screen, waitFor } from '@testing-library/react';
import format from 'date-fns/format';

import NewTaskBoard from './NewTaskBoard';
import {
	ALL_DAY_DATE_TIME_PICKER_DATE_FORMAT,
	MAX_TASKS_LIMIT,
	TIME_SPECIFIC_DATE_TIME_PICKER_DATE_FORMAT
} from '../constants';
import { ICON_REGEXP } from '../constants/tests';
import {
	FindTasksDocument,
	type FindTasksQuery,
	type FindTasksQueryVariables,
	type NewTaskInput,
	Priority,
	Status,
	type Task
} from '../gql/types';
import { mockCreateTask, populateTaskList } from '../mocks/utils';
import { setup } from '../utils/testUtils';

describe('New task board', () => {
	function prepareCache(tasks: Task[] = []): void {
		global.apolloClient.writeQuery<FindTasksQuery, FindTasksQueryVariables>({
			query: FindTasksDocument,
			variables: {},
			data: {
				findTasks: tasks
			}
		});
	}

	test('Show fields for title, priority, reminder toggle and description and create button', () => {
		prepareCache();

		setup(<NewTaskBoard />, { mocks: [] });

		expect(screen.getByText(/details/i)).toBeVisible();
		expect(screen.getByRole('textbox', { name: /title/i })).toBeVisible();
		expect(screen.getByText(/priority/i)).toBeVisible();
		expect(screen.getByText(/enable reminder/i)).toBeVisible();
		expect(screen.getByTestId(ICON_REGEXP.switchOff)).toBeVisible();
		expect(screen.getByText('Description')).toBeVisible();
		expect(screen.getByRole('textbox', { name: /task description/i })).toBeVisible();
		expect(screen.getByRole('button', { name: /create/i })).toBeVisible();
	});

	describe('Title', () => {
		test('When not set the create button is disabled', () => {
			prepareCache();

			setup(<NewTaskBoard />, { mocks: [] });

			expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue('');
			expect(screen.getByRole('button', { name: /create/i })).toBeDisabled();
		});

		test('When there are only spaces the create button is disabled', async () => {
			prepareCache();

			const { user } = setup(<NewTaskBoard />, { mocks: [] });

			const titleInput = screen.getByRole('textbox', { name: /title/i });
			const spaceOnlyString = '                  ';
			await user.type(titleInput, spaceOnlyString);
			expect(titleInput).toHaveValue(spaceOnlyString);
			expect(screen.getByRole('button', { name: /create/i })).toBeDisabled();
		});

		test('When the limit of 1024 characters is reached the create button is disabled and the error description appears', async () => {
			prepareCache();

			const { user } = setup(<NewTaskBoard />, { mocks: [] });

			const titleInput = screen.getByRole('textbox', { name: /title/i });
			const createButton = screen.getByRole('button', { name: /create/i });
			const maxLengthString = faker.random.alpha({ count: 1024 });
			await user.type(titleInput, maxLengthString);
			expect(titleInput).toHaveValue(maxLengthString);
			expect(createButton).toBeEnabled();
			expect(
				screen.queryByText(/Maximum length allowed is 1024 characters/i)
			).not.toBeInTheDocument();
			// type a character to exceed the limit
			await user.type(titleInput, 'a');
			const errorMessage = await screen.findByText(/Maximum length allowed is 1024 characters/i);
			expect(errorMessage).toBeVisible();
			expect(createButton).toBeDisabled();
		});
	});

	test('Priority medium is the default one', () => {
		prepareCache();

		setup(<NewTaskBoard />, { mocks: [] });

		expect(screen.getByText(/medium/i)).toBeVisible();
		expect(screen.getByTestId(ICON_REGEXP.mediumPriority)).toBeVisible();
		expect(screen.queryByTestId(ICON_REGEXP.highPriority)).not.toBeInTheDocument();
		expect(screen.queryByTestId(ICON_REGEXP.lowPriority)).not.toBeInTheDocument();
	});

	describe('Description', () => {
		test('Is optional, if not set the create button is enabled', async () => {
			prepareCache();

			const { user } = setup(<NewTaskBoard />, { mocks: [] });

			const createButton = screen.getByRole('button', { name: /create/i });
			expect(createButton).toBeDisabled();
			await user.type(screen.getByRole('textbox', { name: /title/i }), 'something');
			await waitFor(() => expect(createButton).toBeEnabled());
			expect(screen.getByRole('textbox', { name: /description/i })).toHaveValue('');
		});

		test('When the limit of 4096 characters is reached the create button is disabled and the error description appears', async () => {
			prepareCache();

			const { user } = setup(<NewTaskBoard />, { mocks: [] });

			const createButton = screen.getByRole('button', { name: /create/i });
			const descriptionInput = screen.getByRole('textbox', { name: /description/i });
			const maxLengthDescription = faker.random.alpha({ count: 4096 });
			await user.type(screen.getByRole('textbox', { name: /title/i }), 'something');
			await waitFor(() => expect(createButton).toBeEnabled());
			await user.type(descriptionInput, maxLengthDescription);
			expect(descriptionInput).toHaveValue(maxLengthDescription);
			expect(createButton).toBeEnabled();
			expect(
				screen.queryByText(/Maximum length allowed is 4096 characters/i)
			).not.toBeInTheDocument();
			// type a character to exceed the limit
			await user.type(descriptionInput, 'a');
			await waitFor(() => expect(createButton).toBeDisabled());
			expect(screen.getByText(/Maximum length allowed is 4096 characters/i)).toBeVisible();
		});
	});

	test('Info banner appears when the limit of 199 tasks is reached', async () => {
		const tasks = populateTaskList(MAX_TASKS_LIMIT - 2);
		prepareCache(tasks);

		const newTaskInput: NewTaskInput = {
			priority: Priority.Medium,
			status: Status.Open,
			title: 'task nr 199'
		};

		const newTaskResult: Required<Task> = {
			__typename: 'Task',
			createdAt: new Date().getTime(),
			id: faker.datatype.uuid(),
			description: null,
			reminderAllDay: null,
			reminderAt: null,
			...newTaskInput,
			priority: newTaskInput.priority || Priority.Medium,
			status: newTaskInput.status || Status.Open
		};

		const createTaskMock = mockCreateTask(newTaskInput, newTaskResult);
		const mocks = [createTaskMock];
		const { user } = setup(<NewTaskBoard />, { mocks });

		const infoBannerText =
			/This is the last task you can create\. To create more complete your previous tasks/i;
		expect(screen.queryByText(infoBannerText)).not.toBeInTheDocument();
		const createButton = screen.getByRole('button', { name: /create/i });
		await user.type(screen.getByRole('textbox', { name: /title/i }), newTaskInput.title);
		await waitFor(() => expect(createButton).toBeEnabled());
		await user.click(createButton);
		await screen.findByText(infoBannerText);
		expect(screen.getByText(infoBannerText)).toBeVisible();
	});

	test('Reminder, when all day checkbox is checked the time is missing in the input and in the picker', async () => {
		prepareCache();

		const { user } = setup(<NewTaskBoard />, { mocks: [] });

		const dateString = format(new Date(), ALL_DAY_DATE_TIME_PICKER_DATE_FORMAT);

		const switchOffIcon = screen.getByTestId(ICON_REGEXP.switchOff);
		expect(switchOffIcon).toBeVisible();
		await user.click(switchOffIcon);

		const checkboxLabelText = /Remind me at every login throughout the day/i;
		const allDayLabel = await screen.findByText(checkboxLabelText);
		expect(allDayLabel).toBeVisible();

		await user.click(allDayLabel);

		const reminderInput = await screen.findByPlaceholderText<HTMLInputElement>('Reminder');
		expect(reminderInput).toBeVisible();

		expect(reminderInput).toHaveValue(dateString);

		const inputCalendarIcon = screen.getByTestId(ICON_REGEXP.inputCalendarIcon);
		expect(inputCalendarIcon).toBeVisible();
		await user.click(inputCalendarIcon);

		expect(screen.queryByText('Time')).not.toBeInTheDocument();
	});

	test('Reminder, when all day checkbox is not checked the time is shown in the input and in the picker', async () => {
		prepareCache();

		const { user } = setup(<NewTaskBoard />, { mocks: [] });

		const dateString = format(new Date(), TIME_SPECIFIC_DATE_TIME_PICKER_DATE_FORMAT);

		const switchOffIcon = screen.getByTestId(ICON_REGEXP.switchOff);
		expect(switchOffIcon).toBeVisible();
		await user.click(switchOffIcon);

		const reminderInput = await screen.findByPlaceholderText<HTMLInputElement>('Reminder');
		expect(reminderInput).toBeVisible();

		expect(reminderInput).toHaveValue(dateString);

		const inputCalendarIcon = screen.getByTestId(ICON_REGEXP.inputCalendarIcon);
		expect(inputCalendarIcon).toBeVisible();
		await user.click(inputCalendarIcon);

		const pickerTimeHeader = await screen.findByText('Time');
		expect(pickerTimeHeader).toBeVisible();
	});

	test('Reminder is optional, is not set the create button is not disabled', async () => {
		prepareCache();

		const { user } = setup(<NewTaskBoard />, { mocks: [] });
		const switchOffIcon = screen.getByTestId(ICON_REGEXP.switchOff);
		expect(switchOffIcon).toBeVisible();
		expect(screen.queryByTestId(ICON_REGEXP.switchOn)).not.toBeInTheDocument();

		const checkboxLabelText = /Remind me at every login throughout the day/i;

		expect(screen.queryByText(checkboxLabelText)).not.toBeInTheDocument();
		expect(screen.queryByPlaceholderText<HTMLInputElement>('Reminder')).not.toBeInTheDocument();

		const createButton = screen.getByRole('button', { name: /create/i });
		expect(createButton).toBeDisabled();

		const titleInput = screen.getByRole('textbox', { name: /title/i });
		await user.type(titleInput, faker.random.alpha({ count: 10 }));
		expect(createButton).toBeEnabled();
	});

	test('Reminder is disabled by default, enabling the switch the related picker and checkbox appears', async () => {
		prepareCache();

		const { user } = setup(<NewTaskBoard />, { mocks: [] });
		const switchOffIcon = screen.getByTestId(ICON_REGEXP.switchOff);
		expect(switchOffIcon).toBeVisible();
		expect(screen.queryByTestId(ICON_REGEXP.switchOn)).not.toBeInTheDocument();

		const checkboxLabelText = /Remind me at every login throughout the day/i;

		expect(screen.queryByText(checkboxLabelText)).not.toBeInTheDocument();
		expect(screen.queryByPlaceholderText<HTMLInputElement>('Reminder')).not.toBeInTheDocument();

		await user.click(switchOffIcon);
		expect(screen.getByTestId(ICON_REGEXP.switchOn)).toBeVisible();

		expect(await screen.findByPlaceholderText<HTMLInputElement>('Reminder')).toBeVisible();
		expect(await screen.findByText(checkboxLabelText)).toBeVisible();
	});

	test('Reminder, when is enabled it is set with current date as default', async () => {
		prepareCache();

		const { user } = setup(<NewTaskBoard />, { mocks: [] });

		const dateString = format(new Date(), TIME_SPECIFIC_DATE_TIME_PICKER_DATE_FORMAT);

		const switchOffIcon = screen.getByTestId(ICON_REGEXP.switchOff);
		expect(switchOffIcon).toBeVisible();
		await user.click(switchOffIcon);

		const reminderInput = await screen.findByPlaceholderText<HTMLInputElement>('Reminder');
		expect(reminderInput).toBeVisible();

		expect(reminderInput).toHaveValue(dateString);
	});
});
