/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { noop } from 'lodash';
import { vi } from 'vitest';

// Polyfill globals that jsdom doesn't provide but are needed for MSW and modern browsers
if (typeof global.ReadableStream === 'undefined') {
	global.ReadableStream = ReadableStream;
}
if (typeof global.TextDecoder === 'undefined') {
	global.TextDecoder = TextDecoder;
}
if (typeof global.TextEncoder === 'undefined') {
	global.TextEncoder = TextEncoder;
}
if (typeof global.Blob === 'undefined') {
	global.Blob = Blob;
}
if (typeof global.Headers === 'undefined') {
	global.Headers = Headers;
}
if (typeof global.FormData === 'undefined') {
	global.FormData = FormData;
}
if (typeof global.Request === 'undefined') {
	global.Request = Request;
}
if (typeof global.Response === 'undefined') {
	global.Response = Response;
}
if (typeof global.fetch === 'undefined') {
	global.fetch = fetch;
}
if (typeof global.structuredClone === 'undefined') {
	global.structuredClone = structuredClone;
}
if (typeof global.BroadcastChannel === 'undefined') {
	global.BroadcastChannel = BroadcastChannel;
}
if (typeof global.TransformStream === 'undefined') {
	global.TransformStream = TransformStream;
}

// Mock matchMedia (needed for TinyMCE and other libraries)
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

// Mock scrollIntoView
Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
	writable: true,
	value: noop
});

// Mock scrollTo
Element.prototype.scrollTo = noop;

// Mock resizeTo
window.resizeTo = function resizeTo(width, height): void {
	Object.assign(this, {
		innerWidth: width,
		innerHeight: height,
		outerWidth: width,
		outerHeight: height
	}).dispatchEvent(new this.Event('resize'));
};

// Mock ResizeObserver
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

// mock a simplified crypto
Object.defineProperty(window.crypto, 'randomUUID', {
	writable: true,
	value: vi.fn(() => Math.random().toString())
});


