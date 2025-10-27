/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';
import dotenv from 'dotenv';
import { noop } from 'lodash';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

import buildClient from './apollo';
import server from './mocks/server';

dotenv.config();

configure({
	asyncUtilTimeout: 2000
});

// Fail tests on console errors (except for allowed patterns)
const originalError = console.error;
console.error = (...args: unknown[]) => {
	const errorMessage = args.join(' ');
	const shouldIgnore =
		/Invalid prop `\w+`(\sof type `\w+`)? supplied to `(\w+(\(\w+\))?)`/.test(errorMessage) ||
		/Controlled error/gi.test(errorMessage) ||
		/The "input" argument must be an instance of ArrayBuffer or ArrayBufferView. Received an instance of File/.test(
			errorMessage
		);

	if (!shouldIgnore) {
		originalError(...args);
		throw new Error(`Console error: ${errorMessage}`);
	}
	originalError(...args);
};

beforeEach(() => {
	// Do not useFakeTimers with `whatwg-fetch` if using mocked server
	// https://github.com/mswjs/msw/issues/448
	// Enable fake timers globally, excluding queueMicrotask (equivalent to Jest's fakeTimers config)
	vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate'] });

	// reset apollo client cache
	global.apolloClient.resetStore();

	// mock a simplified Intersection Observer
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
				observe: noop,
				unobserve: noop,
				disconnect: noop
			};
		})
	});
});

beforeAll(() => {
	server.listen({ onUnhandledRequest: 'warn' });

	// initialize an apollo client instance for test and makes it available globally
	global.apolloClient = buildClient();

	// define browser objects not available in jsdom
	// https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom

	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: (query: string): MediaQueryList => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: noop, // Deprecated
			removeListener: noop, // Deprecated
			addEventListener: noop,
			removeEventListener: noop,
			dispatchEvent: () => true
		})
	});

	Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
		writable: true,
		value: noop
	});

	Element.prototype.scrollTo = noop;

	window.resizeTo = function resizeTo(width, height): void {
		Object.assign(this, {
			innerWidth: width,
			innerHeight: height,
			outerWidth: width,
			outerHeight: height
		}).dispatchEvent(new this.Event('resize'));
	};

	Object.defineProperty(window, 'ResizeObserver', {
		writable: true,
		value: function ResizeObserverMock(): ResizeObserver {
			return {
				observe: noop,
				unobserve: noop,
				disconnect: noop
			};
		}
	});
});

afterAll(() => server.close());
afterEach(() => {
	vi.runOnlyPendingTimers();
	vi.useRealTimers();
	server.resetHandlers();
	window.resizeTo(1024, 768);
});
