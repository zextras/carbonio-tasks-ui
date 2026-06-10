/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { graphql } from '../gql';

export const TaskFragmentDoc = graphql(`
	fragment Task on Task {
		id
		description
		priority
		reminderAllDay
		status
		reminderAt
		title
		createdAt
	}
`);

export const FindTasksDocument = graphql(`
	query findTasks($priority: Priority, $status: Status) {
		findTasks(priority: $priority, status: $status) {
			id
			priority
			createdAt
			reminderAllDay
			status
			reminderAt
			title
		}
	}
`);

export const GetTaskDocument = graphql(`
	query getTask($taskId: ID!) {
		getTask(taskId: $taskId) {
			id
			priority
			createdAt
			description
			reminderAllDay
			status
			reminderAt
			title
		}
	}
`);

export const CreateTaskDocument = graphql(`
	mutation createTask($newTask: NewTaskInput!) {
		createTask(newTask: $newTask) {
			...Task
		}
	}
`);

export const UpdateTaskDocument = graphql(`
	mutation updateTask($updateTask: UpdateTaskInput!) {
		updateTask(updateTask: $updateTask) {
			...Task
		}
	}
`);

export const TrashTaskDocument = graphql(`
	mutation trashTask($taskId: ID!) {
		trashTask(taskId: $taskId)
	}
`);

export const UpdateTaskStatusDocument = graphql(`
	mutation updateTaskStatus($id: ID!, $status: Status!) {
		updateTask(updateTask: { id: $id, status: $status }) {
			id
			status
		}
	}
`);
