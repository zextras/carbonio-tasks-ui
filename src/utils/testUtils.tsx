/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { type ReactElement, useMemo } from 'react';

import { ApolloProvider } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import {
	act,
	type ByRoleMatcher,
	type ByRoleOptions,
	type GetAllBy,
	queries,
	queryHelpers,
	render,
	type RenderOptions,
	type RenderResult,
	screen,
	within,
	renderHook
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalManager, SnackbarManager } from '@zextras/carbonio-design-system';
import i18next, { type i18n } from 'i18next';
import { filter } from 'lodash';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { type Mock as ViMock } from 'vitest';

import { StyledWrapper } from '../providers/StyledWrapper';

export type UserEvent = ReturnType<(typeof userEvent)['setup']> & {
	readonly rightClick: (target: Element) => Promise<void>;
};

type ByRoleWithIconOptions = ByRoleOptions & {
	icon: string | RegExp;
};
/**
 * Matcher function to search an icon button through the icon data-testid
 */
const queryAllByRoleWithIcon: GetAllBy<[ByRoleMatcher, ByRoleWithIconOptions]> = (
	container,
	role,
	{ icon, ...options }
) =>
	filter(
		screen.queryAllByRole('button', options),
		(element) => within(element).queryByTestId(icon) !== null
	);
const getByRoleWithIconMultipleError = (
	container: Element | null,
	role: ByRoleMatcher,
	options: ByRoleWithIconOptions
): string => `Found multiple elements with role ${role} and icon ${options.icon}`;
const getByRoleWithIconMissingError = (
	container: Element | null,
	role: ByRoleMatcher,
	options: ByRoleWithIconOptions
): string => `Unable to find an element with role ${role} and icon ${options.icon}`;

const [
	queryByRoleWithIcon,
	getAllByRoleWithIcon,
	getByRoleWithIcon,
	findAllByRoleWithIcon,
	findByRoleWithIcon
] = queryHelpers.buildQueries<[ByRoleMatcher, ByRoleWithIconOptions]>(
	queryAllByRoleWithIcon,
	getByRoleWithIconMultipleError,
	getByRoleWithIconMissingError
);

const customQueries = {
	// byRoleWithIcon
	queryByRoleWithIcon,
	getAllByRoleWithIcon,
	getByRoleWithIcon,
	findAllByRoleWithIcon,
	findByRoleWithIcon
};

export const getAppI18n = (): i18n => {
	const newI18n = i18next.createInstance();
	newI18n
		// init i18next
		// for all options read: https://www.i18next.com/overview/configuration-options
		.init({
			lng: 'en',
			fallbackLng: 'en',
			debug: false,
			compatibilityJSON: 'v4',
			interpolation: {
				escapeValue: false // not needed for react as it escapes by default
			},
			resources: { en: { translation: {} } }
		});
	return newI18n;
};

interface WrapperProps {
	children?: React.ReactNode | undefined;
	initialRouterEntries?: string[];
	mocks?: MockedResponse[];
}

const ApolloProviderWrapper = ({
	children,
	mocks
}: {
	children: React.ReactNode;
	mocks: MockedResponse[] | undefined;
}): React.JSX.Element =>
	mocks ? (
		<MockedProvider mocks={mocks} cache={global.apolloClient.cache}>
			{children}
		</MockedProvider>
	) : (
		<ApolloProvider client={global.apolloClient}>{children}</ApolloProvider>
	);

export const I18NextTestProvider = ({
	i18n,
	children
}: {
	i18n?: typeof i18next;
	children: React.ReactNode;
}): React.JSX.Element => {
	const i18nInstance = useMemo(() => i18n ?? getAppI18n(), [i18n]);

	return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
};

const Wrapper = ({ mocks, initialRouterEntries, children }: WrapperProps): React.JSX.Element => (
	<ApolloProviderWrapper mocks={mocks}>
		<MemoryRouter
			future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
			initialEntries={initialRouterEntries}
			initialIndex={(initialRouterEntries?.length || 1) - 1}
		>
			<StyledWrapper>
				<SnackbarManager>
					<I18NextTestProvider>
						<ModalManager>{children}</ModalManager>
					</I18NextTestProvider>
				</SnackbarManager>
			</StyledWrapper>
		</MemoryRouter>
	</ApolloProviderWrapper>
);

function customRender(
	ui: React.ReactElement,
	{
		initialRouterEntries = ['/'],
		mocks,
		...options
	}: WrapperProps & {
		options?: Omit<RenderOptions, 'queries' | 'wrapper'>;
	} = {}
): RenderResult<typeof queries & typeof customQueries> {
	return render(ui, {
		wrapper: ({ children }: Pick<WrapperProps, 'children'>) => (
			<Wrapper initialRouterEntries={initialRouterEntries} mocks={mocks}>
				{children}
			</Wrapper>
		),
		queries: { ...queries, ...customQueries },
		...options
	});
}

type SetupOptions = Pick<WrapperProps, 'initialRouterEntries' | 'mocks'> & {
	renderOptions?: Omit<RenderOptions, 'queries'>;
	setupOptions?: Parameters<(typeof userEvent)['setup']>[0];
};

const setupUserEvent = (options: SetupOptions['setupOptions']): UserEvent => {
	const user = userEvent.setup(options);
	const rightClick = (target: Element): Promise<void> =>
		user.pointer({ target, keys: '[MouseRight]' });

	return {
		...user,
		rightClick
	};
};

export const setup = (
	ui: ReactElement,
	options?: SetupOptions
): { user: UserEvent } & ReturnType<typeof customRender> => ({
	user: setupUserEvent({ advanceTimers: vi.advanceTimersByTime, ...options?.setupOptions }),
	...customRender(ui, {
		initialRouterEntries: options?.initialRouterEntries,
		mocks: options?.mocks,
		...options?.renderOptions
	})
});

export function makeListItemsVisible(): void {
	const { calls, instances } = (window.IntersectionObserver as ViMock).mock;
	calls.forEach((call, index) => {
		const [onChange] = call;
		// trigger the intersection on the observed element
		act(() => {
			onChange(
				[
					{
						intersectionRatio: 0,
						isIntersecting: true
					} as IntersectionObserverEntry
				],
				instances[index]
			);
		});
	});
}

export function getElementStyles(element: HTMLElement): CSSStyleDeclaration {
	return window.getComputedStyle(element);
}

export function hexToRgb(hex: string): string {
	let tmp = hex.replace('#', '');

	if (tmp.length === 3) {
		tmp = hex
			.split('')
			.map((char) => char + char)
			.join('');
	}

	const r = parseInt(tmp.substring(0, 2), 16);
	const g = parseInt(tmp.substring(2, 4), 16);
	const b = parseInt(tmp.substring(4, 6), 16);

	return `rgb(${r}, ${g}, ${b})`;
}

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
