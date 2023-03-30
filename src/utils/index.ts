/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { debounce, flatten } from 'lodash';
import moment from 'moment';

import { DATE_FORMAT, DATE_TIME_FORMAT } from '../constants';

export function formatDateFromTimestamp(
	timestamp: number,
	options?: { includeTime?: boolean }
): string {
	const date = moment(timestamp);
	// TODO: we should localize the date
	return date.format(options?.includeTime ? DATE_TIME_FORMAT : DATE_FORMAT);
}

export function identity<Type>(arg: Type | null): arg is Type {
	return arg !== null;
}

export function debounceWithAllArgs<T extends Parameters<typeof debounce>[0]>(
	...[callback, wait, options]: Parameters<typeof debounce<T>>
): ReturnType<typeof debounce<T>> {
	let collectedArgs: Array<Parameters<T>> = [];
	const debouncedFn = debounce(
		() => {
			const returnValue = callback(...flatten(collectedArgs));
			collectedArgs = [];
			return returnValue;
		},
		wait,
		options
	);
	const cancelFn = (): void => {
		debouncedFn.cancel();
		collectedArgs = [];
	};
	const flushFn = (): ReturnType<T> | undefined => debouncedFn.flush();
	const invokerFn = (...args: Parameters<T>): ReturnType<T> => {
		collectedArgs.push(args);
		return debouncedFn();
	};
	invokerFn.cancel = cancelFn;
	invokerFn.flush = flushFn;

	return invokerFn;
}
