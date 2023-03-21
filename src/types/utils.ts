/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type OneOrMany<T> = T | T[];

export type Unwrap<T> = T extends Array<infer U> ? U : T;

export type NonNullableList<T extends Array<unknown>> = Array<NonNullable<Unwrap<T>>>;

export type NonNullableListItem<T extends Array<unknown>> = NonNullable<Unwrap<T>>;

export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
