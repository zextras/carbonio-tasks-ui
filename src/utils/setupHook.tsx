/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { renderHook } from '@testing-library/react';
import { type i18n } from 'i18next';

import { I18NextTestProvider } from './testUtils';

export const setupHook = <TProps, TResult>(
	callback: Parameters<typeof renderHook<TProps, TResult>>[0],
	options?: Parameters<typeof renderHook<TProps, TResult>>[1] & { i18n?: i18n }
): ReturnType<typeof renderHook<TProps, TResult>> =>
	renderHook<TProps, TResult>(callback, {
		wrapper: ({ children }) => (
			<I18NextTestProvider i18n={options?.i18n}>{children}</I18NextTestProvider>
		),
		...options
	});
