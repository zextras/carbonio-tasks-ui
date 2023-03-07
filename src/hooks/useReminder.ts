/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useContext, useMemo } from 'react';

import moment from 'moment-timezone';

import { TimeZoneContext } from '../contexts';
import { formatDateFromTimestamp } from '../utils';

type UseReminderReturnType = {
	isExpired: boolean;
	formattedDate: string;
};

export const useReminder = (
	reminderAt: number | null | undefined,
	reminderAllDay: boolean | null | undefined
): UseReminderReturnType => {
	const timeZoneId = useContext(TimeZoneContext);

	const isExpired = useMemo(() => {
		if (reminderAt) {
			const now = moment().tz(timeZoneId);
			if (reminderAllDay) {
				return moment(reminderAt).isBefore(now, 'day');
			}

			return moment(reminderAt).isBefore(now);
		}
		return false;
	}, [reminderAllDay, reminderAt, timeZoneId]);

	const formattedDate = useMemo(() => {
		if (reminderAt) {
			return formatDateFromTimestamp(reminderAt, {
				timezone: timeZoneId,
				includeTime: reminderAllDay !== true
			});
		}
		return '';
	}, [reminderAllDay, reminderAt, timeZoneId]);

	return { isExpired, formattedDate };
};
