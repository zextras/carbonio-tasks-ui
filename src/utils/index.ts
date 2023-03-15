/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import moment from 'moment-timezone';

import { DATE_FORMAT, DATE_TIME_FORMAT } from '../constants';

export function formatDateFromTimestamp(
	timestamp: number,
	options?: { timezone?: string; includeTime?: boolean }
): string {
	let date = moment(timestamp);
	if (options?.timezone) {
		date = date.tz(options.timezone);
	}
	return date.format(options?.includeTime ? DATE_TIME_FORMAT : DATE_FORMAT);
}

export function identity<Type>(arg: Type | null): arg is Type {
	return arg !== null;
}
