/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import moment from 'moment';

import { formatDateFromTimestamp } from '../utils';

type UseReminderReturnType = {
	isExpired: boolean;
	formattedDate: string;
};

export const useReminder = (
	reminderAt: number | null | undefined,
	reminderAllDay: boolean | null | undefined
): UseReminderReturnType => {
	const isExpired = useMemo(() => {
		if (reminderAt) {
			const now = moment();
			if (reminderAllDay) {
				return moment(reminderAt).isBefore(now, 'day');
			}

			return moment(reminderAt).isBefore(now);
		}
		return false;
	}, [reminderAllDay, reminderAt]);

	const formattedDate = useMemo(() => {
		if (reminderAt) {
			return formatDateFromTimestamp(reminderAt, {
				includeTime: reminderAllDay !== true
			});
		}
		return '';
	}, [reminderAllDay, reminderAt]);

	return { isExpired, formattedDate };
};
