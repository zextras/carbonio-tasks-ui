/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { DisplayerContent } from './DisplayerContent';
import { DisplayerHeader } from './DisplayerHeader';
import type { Task } from '../gql/types';

interface TaskDisplayerProps {
	task: Task;
}
export const TaskDisplayer = ({ task }: TaskDisplayerProps): JSX.Element => (
	<Container background={'gray5'} mainAlignment={'flex-start'}>
		<DisplayerHeader title={task.title} />
		<DisplayerContent task={task} />
	</Container>
);
