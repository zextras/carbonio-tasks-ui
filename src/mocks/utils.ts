/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ApolloLink } from '@apollo/client';
import type { MockLink } from '@apollo/client/testing';
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
> extends MockLink.MockedResponse<TData> {
	request: {
		query: DocumentNode;
		variables: V;
	};
}

/**
 * A fully-populated `Task`: the nullable fields are guaranteed present (never `undefined`), which
 * makes it assignable to the operation result types (where nullable fields are `T | null`, not the
 * optional `T | null | undefined` of the schema `Task` type).
 */
export type PopulatedTask = Task &
	Required<Pick<Task, 'description' | 'reminderAllDay' | 'reminderAt'>>;

export function populateTask(partialTask?: Partial<Task>): PopulatedTask {
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
): PopulatedTask[] {
	const list: PopulatedTask[] = [];
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
		result: vi.fn(
			(): ApolloLink.Result<GetTaskQuery> => ({
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
	tasks: PopulatedTask[],
	error?: Error
): Mock<FindTasksQuery, FindTasksQueryVariables> {
	return {
		request: {
			query: FindTasksDocument,
			variables
		},
		result: vi.fn(
			(): ApolloLink.Result<FindTasksQuery> => ({
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
	// Apollo needs `__typename` at runtime to normalize the result into the cache; the operation
	// result type does not model it (the document doesn't select it), so we add it back and cast.
	updateTask: UpdateTaskStatusMutation['updateTask'] = {
		__typename: 'Task',
		...variables
	} as UpdateTaskStatusMutation['updateTask']
): Mock<UpdateTaskStatusMutation, UpdateTaskStatusMutationVariables> {
	return {
		request: {
			query: UpdateTaskStatusDocument,
			variables
		},
		result: vi.fn(
			(): ApolloLink.Result<UpdateTaskStatusMutation> => ({
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
		result: vi.fn(
			(): ApolloLink.Result<TrashTaskMutation> => ({
				data: {
					trashTask
				}
			})
		)
	};
}

export function mockCreateTask(
	variables: NewTaskInput,
	task: PopulatedTask
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
		result: vi.fn(
			(): ApolloLink.Result<CreateTaskMutation> => ({
				data: {
					createTask: task
				}
			})
		)
	};
}

export function mockUpdateTask(
	variables: UpdateTaskInput,
	task: PopulatedTask
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
		result: vi.fn(
			(): ApolloLink.Result<UpdateTaskMutation> => ({
				data: {
					updateTask: task
				}
			})
		)
	};
}
