/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
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

// mock a simplified crypto
Object.defineProperty(window.crypto, 'randomUUID', {
	writable: true,
	value: vi.fn(() => Math.random().toString())
});

