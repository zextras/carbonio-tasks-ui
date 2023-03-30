/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { type TextProps } from '@zextras/carbonio-design-system';

import { Text } from './Text';
import type { Task } from '../gql/types';
import { useReminder } from '../hooks/useReminder';

type ReminderProps = Pick<Task, 'reminderAt' | 'reminderAllDay'> & TextProps;

export const Reminder = ({
	reminderAt,
	reminderAllDay,
	...textProps
}: ReminderProps): JSX.Element => {
	const { isExpired, formattedDate } = useReminder(reminderAt, reminderAllDay);

	return (
		<Text
			color={isExpired ? 'error' : 'text'}
			weight={isExpired ? 'bold' : 'regular'}
			size="small"
			inline
			{...textProps}
		>
			{formattedDate}
		</Text>
	);
};
