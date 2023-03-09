/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
declare module '*.graphql' {
	import { type DocumentNode } from 'graphql';

	const defaultDocument: DocumentNode;

	export default defaultDocument;
}
