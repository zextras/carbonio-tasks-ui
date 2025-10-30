/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '@testing-library/jest-dom';
import failOnConsole from 'vitest-fail-on-console';

import buildClient from './apollo';
import server from './mocks/server';

failOnConsole({
	shouldFailOnWarn: false,
	shouldFailOnError: true,
	silenceMessage: (message) =>
		// Warning: Failed prop type: Invalid prop `target` of type `Window` supplied to `ForwardRef(SnackbarFn)`, expected instance of `Window`
		// This warning is printed in the console for this render. This happens because window element is a jsdom representation of the window,
		// and it's an object instead of a Window class instance, so the check on the prop type fail for the target prop
		/Invalid prop `\w+`(\sof type `\w+`)? supplied to `(\w+(\(\w+\))?)`/.test(message) ||
		// errors forced from the tests
		/Controlled error/gi.test(message) ||
		/The "input" argument must be an instance of ArrayBuffer or ArrayBufferView. Received an instance of File/.test(
			message
		)
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
	global.apolloClient = buildClient();
});
beforeEach(() => {
	global.apolloClient.resetStore();
});
