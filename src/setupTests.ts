/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '@testing-library/jest-dom/vitest';
import failOnConsole from 'vitest-fail-on-console';

import buildClient from './apollo';
import server from './mocks/server';

failOnConsole({
	silenceMessage: (message) =>
		// errors forced from the tests
		/Controlled error/gi.test(message)
});

beforeAll(() => {
	vi.useFakeTimers({
		shouldAdvanceTime: true
	});
});

afterAll(() => {
	vi.useRealTimers();
});

beforeAll(() => {
	Object.defineProperty(window, 'ResizeObserver', {
		writable: true,
		value: function ResizeObserverMock(): ResizeObserver {
			return {
				observe: (): undefined => undefined,
				unobserve: (): undefined => undefined,
				disconnect: (): undefined => undefined
			};
		}
	});
});

beforeEach(() => {
	Object.defineProperty(window, 'IntersectionObserver', {
		writable: true,
		value: vi.fn(function intersectionObserverMock(
			callback: IntersectionObserverCallback,
			options: IntersectionObserverInit
		) {
			return {
				thresholds: options.threshold,
				root: options.root,
				rootMargin: options.rootMargin,
				observe: (): undefined => undefined,
				unobserve: (): undefined => undefined,
				disconnect: (): undefined => undefined
			};
		})
	});
});

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeAll(() => {
	globalThis.apolloClient = buildClient();
});
beforeEach(async () => {
	await globalThis.apolloClient.clearStore();
});
