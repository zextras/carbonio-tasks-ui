/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	type GraphQLContext,
	type GraphQLRequest,
	type GraphQLVariables,
	type ResponseResolver
} from 'msw';

export type TasksPathParams = {
	taskId: string;
};

export type GraphQLResponseResolver<
	TData extends Record<string, unknown>,
	TVariables extends GraphQLVariables
> = ResponseResolver<GraphQLRequest<TVariables>, GraphQLContext<TData>, TData>;
