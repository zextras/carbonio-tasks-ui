/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { useQuery } from '@apollo/client/react';
import { Container } from '@zextras/carbonio-design-system';

import { EmptyDisplayer } from './EmptyDisplayer';
import { TaskDisplayer } from './TaskDisplayer';
import { GetTaskDocument, type Task } from '../gql/types';
import { useActiveItem } from '../hooks/useActiveItem';

export interface DisplayerProps {
	translationKey: string;
}

export const Displayer = ({ translationKey }: DisplayerProps): React.JSX.Element => {
	const { activeItem } = useActiveItem();
	const { data, previousData, error } = useQuery(GetTaskDocument, {
		variables: {
			taskId: activeItem
		},
		skip: !activeItem,
		returnPartialData: true,
		errorPolicy: 'all'
	});

	// Apollo Client 4 sets data to undefined when a network error occurs (even with
	// errorPolicy 'all'). Only in that case fall back to previousData, so the partial
	// data already loaded from the cache stays visible. When there is no error (e.g.
	// the displayer is closed and the query is skipped) data must stay empty.
	const taskData = data?.getTask ?? (error ? previousData?.getTask : undefined);

	const task = useMemo(
		() =>
			// since we are accepting partial data, check that at least the task has the id valued
			(taskData?.id && (taskData as Task)) || undefined,
		[taskData]
	);

	return (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			data-testid="displayer"
		>
			{task ? <TaskDisplayer task={task} /> : <EmptyDisplayer translationKey={translationKey} />}
		</Container>
	);
};
