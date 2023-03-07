/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { ActionsHeader } from './ActionsHeader';
import { TaskDetails } from './TaskDetails';
import type { Task } from '../gql/types';

interface DisplayerContentProps {
	task: Pick<Task, 'createdAt' | 'priority' | 'reminderAt' | 'reminderAllDay' | 'description'>;
}
export const DisplayerContent = ({ task }: DisplayerContentProps): JSX.Element => (
	<Container padding={{ horizontal: '1rem' }} mainAlignment={'flex-start'}>
		<ActionsHeader />
		<TaskDetails
			createdAt={task.createdAt}
			priority={task.priority}
			reminderAt={task.reminderAt}
			reminderAllDay={task.reminderAllDay}
			description={task.description}
		/>
	</Container>
);
