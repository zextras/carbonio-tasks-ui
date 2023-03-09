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
	GetTaskDocument,
	type GetTaskQuery,
	type GetTaskQueryVariables,
	Priority,
	Status,
	type Task
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

export function populateTask(): Task {
	return {
		__typename: 'Task',
		id: faker.datatype.uuid(),
		title: faker.lorem.sentence(),
		description: faker.helpers.arrayElement([faker.lorem.sentences(), null]),
		createdAt: faker.date.past().getTime(),
		priority: Priority.Medium,
		status: Status.Open,
		reminderAt: faker.helpers.arrayElement([faker.datatype.datetime().getTime(), null]),
		reminderAllDay: faker.helpers.arrayElement([faker.datatype.boolean(), null])
	};
}

export function populateTaskList(limit = 10): Task[] {
	const list: Task[] = [];
	for (let i = 0; i < limit; i += 1) {
		list.push(populateTask());
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
