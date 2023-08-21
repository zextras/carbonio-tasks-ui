/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { ActionsHeader } from './ActionsHeader';
import { DisplayerHeader } from './DisplayerHeader';
import { TaskDetails } from './TaskDetails';
import type { Task } from '../gql/types';
import { useActions } from '../hooks/useActions';

interface TaskDisplayerProps {
	task: Task;
}
export const TaskDisplayer = ({ task }: TaskDisplayerProps): React.JSX.Element => {
	const actions = useActions(task);
	return (
		<Container background={'gray5'} mainAlignment={'flex-start'} padding={{ bottom: '1rem' }}>
			<DisplayerHeader title={task.title} />
			<Container
				padding={{ horizontal: '1rem' }}
				mainAlignment={'flex-start'}
				minHeight={0}
				maxHeight={'100%'}
			>
				<ActionsHeader actions={actions} />
				<TaskDetails
					createdAt={task.createdAt}
					priority={task.priority}
					reminderAt={task.reminderAt}
					reminderAllDay={task.reminderAllDay}
					description={task.description}
				/>
			</Container>
		</Container>
	);
};
