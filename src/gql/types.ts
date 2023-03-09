/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable camelcase,no-shadow */
// THIS FILE IS AUTOGENERATED BY GRAPHQL-CODEGEN. DO NOT EDIT!
import { type TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: string;
	String: string;
	Boolean: boolean;
	Int: number;
	Float: number;
	DateTime: number;
};

export type Mutation = {
	__typename?: 'Mutation';
	createTask: Task;
	updateTask: Task;
};

export type MutationCreateTaskArgs = {
	newTask?: InputMaybe<NewTaskInput>;
};

export type MutationUpdateTaskArgs = {
	updateTask?: InputMaybe<UpdateTaskInput>;
};

export type NewTaskInput = {
	description?: InputMaybe<Scalars['String']>;
	/**  If not set then the default is NORMAL */
	priority?: InputMaybe<Priority>;
	/**  If set but the reminderAt is not set the creation fails */
	reminderAllDay?: InputMaybe<Scalars['Boolean']>;
	/**
	 *  If not set then the task does not have a reminder and
	 *  the reminderAllDay attribute must not be set
	 */
	reminderAt?: InputMaybe<Scalars['DateTime']>;
	/**  If not set then the default is OPEN */
	status?: InputMaybe<Status>;
	title: Scalars['String'];
};

export enum Priority {
	High = 'HIGH',
	Low = 'LOW',
	Medium = 'MEDIUM'
}

export type Query = {
	__typename?: 'Query';
	findTasks: Array<Maybe<Task>>;
	getServiceInfo: ServiceInfo;
	getTask?: Maybe<Task>;
};

export type QueryFindTasksArgs = {
	priority?: InputMaybe<Priority>;
	status?: InputMaybe<Status>;
};

export type QueryGetTaskArgs = {
	taskId: Scalars['ID'];
};

export type ServiceInfo = {
	__typename?: 'ServiceInfo';
	name: Scalars['String'];
	version: Scalars['String'];
};

export enum Status {
	Complete = 'COMPLETE',
	Open = 'OPEN'
}

/**
 * type Config {
 *     name: String!
 *     value: String!
 * }
 */
export type Task = {
	__typename?: 'Task';
	createdAt: Scalars['DateTime'];
	/**  The description has a limit of 4096 characters */
	description?: Maybe<Scalars['String']>;
	id: Scalars['ID'];
	priority: Priority;
	/**
	 *  When this boolean is set then the reminder will be for all day
	 *  If not set the default is false
	 */
	reminderAllDay?: Maybe<Scalars['Boolean']>;
	reminderAt?: Maybe<Scalars['DateTime']>;
	status: Status;
	/**  The title has a limit of 1024 characters and cannot have a string with only spaces */
	title: Scalars['String'];
};

export type UpdateTaskInput = {
	description?: InputMaybe<Scalars['String']>;
	id: Scalars['ID'];
	/**  If not set then the default is NORMAL */
	priority?: InputMaybe<Priority>;
	/**  If set but the reminderAt is not set the creation fails */
	reminderAllDay?: InputMaybe<Scalars['Boolean']>;
	/**
	 *  If not set then the task does not have a reminder and
	 *  the reminderAllDay attribute must not be set
	 */
	reminderAt?: InputMaybe<Scalars['DateTime']>;
	/**  If not set then the default is OPEN */
	status?: InputMaybe<Status>;
	title?: InputMaybe<Scalars['String']>;
};

export type TaskFragment = {
	id: string;
	description?: string | null;
	priority: Priority;
	reminderAllDay?: boolean | null;
	status: Status;
	reminderAt?: number | null;
	title: string;
	createdAt: number;
} & { __typename?: 'Task' };

export type CreateTaskMutationVariables = Exact<{
	newTask?: InputMaybe<NewTaskInput>;
}>;

export type CreateTaskMutation = {
	createTask: {
		id: string;
		description?: string | null;
		priority: Priority;
		reminderAllDay?: boolean | null;
		status: Status;
		reminderAt?: number | null;
		title: string;
		createdAt: number;
	} & { __typename?: 'Task' };
} & { __typename?: 'Mutation' };

export type FindTasksQueryVariables = Exact<{
	priority?: InputMaybe<Priority>;
	status?: InputMaybe<Status>;
}>;

export type FindTasksQuery = {
	findTasks: Array<
		| ({
				id: string;
				priority: Priority;
				createdAt: number;
				description?: string | null;
				reminderAllDay?: boolean | null;
				status: Status;
				reminderAt?: number | null;
				title: string;
		  } & { __typename?: 'Task' })
		| null
	>;
} & { __typename?: 'Query' };

export type GetTaskQueryVariables = Exact<{
	taskId: Scalars['ID'];
}>;

export type GetTaskQuery = {
	getTask?:
		| ({
				id: string;
				priority: Priority;
				createdAt: number;
				description?: string | null;
				reminderAllDay?: boolean | null;
				status: Status;
				reminderAt?: number | null;
				title: string;
		  } & { __typename?: 'Task' })
		| null;
} & { __typename?: 'Query' };

export const TaskFragmentDoc = {
	kind: 'Document',
	definitions: [
		{
			kind: 'FragmentDefinition',
			name: { kind: 'Name', value: 'Task' },
			typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Task' } },
			selectionSet: {
				kind: 'SelectionSet',
				selections: [
					{ kind: 'Field', name: { kind: 'Name', value: 'id' } },
					{ kind: 'Field', name: { kind: 'Name', value: 'description' } },
					{ kind: 'Field', name: { kind: 'Name', value: 'priority' } },
					{ kind: 'Field', name: { kind: 'Name', value: 'reminderAllDay' } },
					{ kind: 'Field', name: { kind: 'Name', value: 'status' } },
					{ kind: 'Field', name: { kind: 'Name', value: 'reminderAt' } },
					{ kind: 'Field', name: { kind: 'Name', value: 'title' } },
					{ kind: 'Field', name: { kind: 'Name', value: 'createdAt' } }
				]
			}
		}
	]
} as unknown as DocumentNode<TaskFragment, unknown>;
export const CreateTaskDocument = {
	kind: 'Document',
	definitions: [
		{
			kind: 'OperationDefinition',
			operation: 'mutation',
			name: { kind: 'Name', value: 'createTask' },
			variableDefinitions: [
				{
					kind: 'VariableDefinition',
					variable: { kind: 'Variable', name: { kind: 'Name', value: 'newTask' } },
					type: { kind: 'NamedType', name: { kind: 'Name', value: 'NewTaskInput' } }
				}
			],
			selectionSet: {
				kind: 'SelectionSet',
				selections: [
					{
						kind: 'Field',
						name: { kind: 'Name', value: 'createTask' },
						arguments: [
							{
								kind: 'Argument',
								name: { kind: 'Name', value: 'newTask' },
								value: { kind: 'Variable', name: { kind: 'Name', value: 'newTask' } }
							}
						],
						selectionSet: {
							kind: 'SelectionSet',
							selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Task' } }]
						}
					}
				]
			}
		},
		...TaskFragmentDoc.definitions
	]
} as unknown as DocumentNode<CreateTaskMutation, CreateTaskMutationVariables>;
export const FindTasksDocument = {
	kind: 'Document',
	definitions: [
		{
			kind: 'OperationDefinition',
			operation: 'query',
			name: { kind: 'Name', value: 'findTasks' },
			variableDefinitions: [
				{
					kind: 'VariableDefinition',
					variable: { kind: 'Variable', name: { kind: 'Name', value: 'priority' } },
					type: { kind: 'NamedType', name: { kind: 'Name', value: 'Priority' } }
				},
				{
					kind: 'VariableDefinition',
					variable: { kind: 'Variable', name: { kind: 'Name', value: 'status' } },
					type: { kind: 'NamedType', name: { kind: 'Name', value: 'Status' } }
				}
			],
			selectionSet: {
				kind: 'SelectionSet',
				selections: [
					{
						kind: 'Field',
						name: { kind: 'Name', value: 'findTasks' },
						arguments: [
							{
								kind: 'Argument',
								name: { kind: 'Name', value: 'priority' },
								value: { kind: 'Variable', name: { kind: 'Name', value: 'priority' } }
							},
							{
								kind: 'Argument',
								name: { kind: 'Name', value: 'status' },
								value: { kind: 'Variable', name: { kind: 'Name', value: 'status' } }
							}
						],
						selectionSet: {
							kind: 'SelectionSet',
							selections: [
								{ kind: 'Field', name: { kind: 'Name', value: 'id' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'priority' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'description' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'reminderAllDay' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'status' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'reminderAt' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'title' } }
							]
						}
					}
				]
			}
		}
	]
} as unknown as DocumentNode<FindTasksQuery, FindTasksQueryVariables>;
export const GetTaskDocument = {
	kind: 'Document',
	definitions: [
		{
			kind: 'OperationDefinition',
			operation: 'query',
			name: { kind: 'Name', value: 'getTask' },
			variableDefinitions: [
				{
					kind: 'VariableDefinition',
					variable: { kind: 'Variable', name: { kind: 'Name', value: 'taskId' } },
					type: {
						kind: 'NonNullType',
						type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } }
					}
				}
			],
			selectionSet: {
				kind: 'SelectionSet',
				selections: [
					{
						kind: 'Field',
						name: { kind: 'Name', value: 'getTask' },
						arguments: [
							{
								kind: 'Argument',
								name: { kind: 'Name', value: 'taskId' },
								value: { kind: 'Variable', name: { kind: 'Name', value: 'taskId' } }
							}
						],
						selectionSet: {
							kind: 'SelectionSet',
							selections: [
								{ kind: 'Field', name: { kind: 'Name', value: 'id' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'priority' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'description' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'reminderAllDay' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'status' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'reminderAt' } },
								{ kind: 'Field', name: { kind: 'Name', value: 'title' } }
							]
						}
					}
				]
			}
		}
	]
} as unknown as DocumentNode<GetTaskQuery, GetTaskQueryVariables>;
