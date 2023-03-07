/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { TextExtended as Text } from './Text';
import type { Task } from '../gql/types';
import { useReminder } from '../hooks/useReminder';

type ReminderProps = Pick<Task, 'reminderAt' | 'reminderAllDay'>;

export const Reminder = ({ reminderAt, reminderAllDay }: ReminderProps): JSX.Element => {
	const { isExpired, formattedDate } = useReminder(reminderAt, reminderAllDay);

	return (
		<Text
			color={isExpired ? 'error' : 'text'}
			weight={isExpired ? 'bold' : 'regular'}
			size="small"
			inline
		>
			{formattedDate}
		</Text>
	);
};
