/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Text } from '@zextras/carbonio-design-system';
import moment from 'moment-timezone';
import { useTranslation } from 'react-i18next';

import { InlineText } from './StyledComponents';
import { Task } from '../gql/types';

type ReminderProps = Pick<Task, 'reminderAt' | 'reminderAllDay'> & {
	timeZoneId: string;
	isReminderExpired: boolean;
};

export const Reminder = ({
	timeZoneId,
	isReminderExpired,
	reminderAt,
	reminderAllDay
}: ReminderProps): JSX.Element => {
	const [t] = useTranslation();

	const reminderAtFormatted = useMemo(
		() =>
			reminderAt
				? moment(reminderAt)
						.tz(timeZoneId)
						.format(reminderAllDay ? 'MMM DD, YYYY' : 'MMM DD, YYYY - HH:mm')
				: '',
		[reminderAllDay, reminderAt, timeZoneId]
	);

	return (
		<>
			<Text size="small">{t('tasksListItem.reminder.remindMeOn', 'Remind me on')}&nbsp;</Text>
			<InlineText
				color={isReminderExpired ? 'error' : 'text'}
				weight={isReminderExpired ? 'bold' : 'regular'}
				size="small"
			>
				{reminderAtFormatted}
			</InlineText>
		</>
	);
};
