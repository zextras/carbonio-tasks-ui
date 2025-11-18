/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import styled from '@emotion/styled';
import { type TextProps, Text } from '@zextras/carbonio-design-system';

import type { Task } from '../gql/types';
import { useReminder } from '../hooks/useReminder';

type ReminderProps = Pick<Task, 'reminderAt' | 'reminderAllDay'> & TextProps;

const StyledText = styled(Text)`
	display: 'inline';
`;

export const Reminder = ({
	reminderAt,
	reminderAllDay,
	...textProps
}: ReminderProps): React.JSX.Element => {
	const { isExpired, formattedDate } = useReminder(reminderAt, reminderAllDay);

	return (
		<StyledText
			color={isExpired ? 'error' : 'text'}
			weight={isExpired ? 'bold' : 'regular'}
			size="small"
			lineHeight={1.5}
			{...textProps}
		>
			{formattedDate}
		</StyledText>
	);
};
