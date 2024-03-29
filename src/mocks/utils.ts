/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { FetchResult } from '@apollo/client';
import type { MockedResponse } from '@apollo/client/testing';
import { faker } from '@faker-js/faker';
import type { DocumentNode } from 'graphql';

import {
	CreateTaskDocument,
	type CreateTaskMutation,
	type CreateTaskMutationVariables,
	FindTasksDocument,
	type FindTasksQuery,
	type FindTasksQueryVariables,
	GetTaskDocument,
	type GetTaskQuery,
	type GetTaskQueryVariables,
	type NewTaskInput,
	Priority,
	Status,
	type Task,
	TrashTaskDocument,
	type TrashTaskMutation,
	type TrashTaskMutationVariables,
	UpdateTaskDocument,
	type UpdateTaskInput,
	type UpdateTaskMutation,
	type UpdateTaskMutationVariables,
	UpdateTaskStatusDocument,
	type UpdateTaskStatusMutation,
	type UpdateTaskStatusMutationVariables
} from '../gql/types';

export interface Mock<
	TData extends Record<string, unknown> = Record<string, unknown>,
	V extends Record<string, unknown> = Record<string, unknown>
> extends MockedResponse<TData> {
	request: {
		query: DocumentNode;
		variables: V;
	};
}

export function populateTask(partialTask?: Partial<Task>): Task {
	return {
		__typename: 'Task',
		id: faker.string.uuid(),
		title: faker.lorem.sentence(),
		description: faker.helpers.arrayElement([faker.lorem.sentences(), null]),
		createdAt: faker.date.past().getTime(),
		priority: Priority.Medium,
		status: Status.Open,
		reminderAt: faker.helpers.arrayElement([faker.date.anytime().getTime(), null]),
		reminderAllDay: faker.helpers.arrayElement([faker.datatype.boolean(), null]),
		...partialTask
	};
}

export function populateTaskList(
	limit?: number,
	defaultValue?: Partial<Task> | ((index: number) => Partial<Task>)
): Task[] {
	const list: Task[] = [];
	const _limit = limit || 10;
	for (let i = 0; i < _limit; i += 1) {
		const defaultTask = typeof defaultValue === 'function' ? defaultValue(i) : defaultValue;
		list.push(populateTask(defaultTask));
	}
	return list;
}

export function mockGetTask(
	variables: GetTaskQueryVariables,
	task: GetTaskQuery['getTask'],
	error?: Error
): Mock<GetTaskQuery, GetTaskQueryVariables> {
	return {
		request: {
			query: GetTaskDocument,
			variables
		},
		result: jest.fn(
			(): FetchResult<GetTaskQuery> => ({
				data: {
					getTask: task
				}
			})
		),
		error
	};
}

export function mockFindTasks(
	variables: FindTasksQueryVariables,
	tasks: Task[],
	error?: Error
): Mock<FindTasksQuery, FindTasksQueryVariables> {
	return {
		request: {
			query: FindTasksDocument,
			variables
		},
		result: jest.fn(
			(): FetchResult<FindTasksQuery> => ({
				data: {
					findTasks: tasks
				}
			})
		),
		error
	};
}

export function mockUpdateTaskStatus(
	variables: UpdateTaskStatusMutationVariables,
	updateTask: UpdateTaskStatusMutation['updateTask'] = { __typename: 'Task', ...variables }
): Mock<UpdateTaskStatusMutation, UpdateTaskStatusMutationVariables> {
	return {
		request: {
			query: UpdateTaskStatusDocument,
			variables
		},
		result: jest.fn(
			(): FetchResult<UpdateTaskStatusMutation> => ({
				data: {
					updateTask
				}
			})
		)
	};
}

export function mockTrashTask(
	variables: TrashTaskMutationVariables,
	trashTask: TrashTaskMutation['trashTask'] = variables.taskId
): Mock<TrashTaskMutation, TrashTaskMutationVariables> {
	return {
		request: {
			query: TrashTaskDocument,
			variables
		},
		result: jest.fn(
			(): FetchResult<TrashTaskMutation> => ({
				data: {
					trashTask
				}
			})
		)
	};
}

export function mockCreateTask(
	variables: NewTaskInput,
	task: Task
): Mock<CreateTaskMutation, CreateTaskMutationVariables> {
	return {
		request: {
			query: CreateTaskDocument,
			variables: {
				newTask: {
					description: variables.description,
					reminderAt: variables.reminderAt,
					reminderAllDay: variables.reminderAllDay,
					status: variables.status,
					priority: variables.priority,
					title: variables.title
				}
			}
		},
		result: jest.fn(
			(): FetchResult<CreateTaskMutation> => ({
				data: {
					createTask: task
				}
			})
		)
	};
}

export function mockUpdateTask(
	variables: UpdateTaskInput,
	task: Task
): Mock<UpdateTaskMutation, UpdateTaskMutationVariables> {
	return {
		request: {
			query: UpdateTaskDocument,
			variables: {
				updateTask: {
					id: variables.id,
					description: variables.description,
					reminderAt: variables.reminderAt,
					reminderAllDay: variables.reminderAllDay,
					status: variables.status,
					priority: variables.priority,
					title: variables.title
				}
			}
		},
		result: jest.fn(
			(): FetchResult<UpdateTaskMutation> => ({
				data: {
					updateTask: task
				}
			})
		)
	};
}
