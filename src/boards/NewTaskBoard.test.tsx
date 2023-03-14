/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { screen, waitFor } from '@testing-library/react';

import NewTaskBoard from './NewTaskBoard';
import { INFO_BANNER_LIMIT } from '../constants';
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
		const tasks = populateTaskList(INFO_BANNER_LIMIT - 1);
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

	test.todo(
		'Reminder, when all day checkbox is checked the time is missing in the input and in the picker'
	);

	test.todo(
		'Reminder, when all day checkbox is not checked the time is shown in the input and in the picker'
	);

	test.todo('Reminder is optional, is not set the create button is not disabled');

	test.todo(
		'Reminder is disabled by default, enabling the switch the related picker and checkbox appears'
	);

	test.todo('Reminder, when is enabled it is set with current date as default');
});
