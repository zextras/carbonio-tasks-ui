/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { useQuery } from '@apollo/client';
import { Container } from '@zextras/carbonio-design-system';

import { EmptyDisplayer } from './EmptyDisplayer';
import { TaskDisplayer } from './TaskDisplayer';
import { GetTaskDocument } from '../gql/types';
import { useActiveItem } from '../hooks/useActiveItem';

export interface DisplayerProps {
	translationKey: string;
}

export const Displayer = ({ translationKey }: DisplayerProps): JSX.Element => {
	const { activeItem } = useActiveItem();
	const { data } = useQuery(GetTaskDocument, {
		variables: {
			taskId: activeItem
		},
		skip: !activeItem,
		returnPartialData: true,
		errorPolicy: 'all'
	});

	const task = useMemo(
		() =>
			// since we are accepting partial data, check that at least the task has the id valued
			(data?.getTask?.id && data.getTask) || undefined,
		[data?.getTask]
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
