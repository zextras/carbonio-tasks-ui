/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';
import { Container, Responsive } from '@zextras/carbonio-design-system';
import { useQuery } from '@apollo/client';
import { filter } from 'lodash';
import { DISPLAYER_WIDTH } from '../../constants';
import { Displayer } from '../../components/Displayer';
import { FindTasksDocument, FindTasksQuery } from '../../gql/types';
import { ListContext } from '../../contexts';
import { NonNullableList } from '../../types/utils';
import { TaskList } from '../../components/TaskList';

function identity<Type>(arg: Type | null): arg is Type {
	return arg !== null;
}

export const TasksView = (): JSX.Element => {
	const { data: findTasksResult } = useQuery(FindTasksDocument, {
		fetchPolicy: 'network-only',
		// set next fetch policy to cache-first so that re-renders does not trigger new network queries
		nextFetchPolicy: 'cache-first',
		notifyOnNetworkStatusChange: true,
		errorPolicy: 'all'
	});

	const tasks = useMemo((): NonNullableList<FindTasksQuery['findTasks']> => {
		if (findTasksResult?.findTasks && findTasksResult.findTasks.length > 0) {
			return filter(findTasksResult.findTasks, identity);
		}
		return [];
	}, [findTasksResult]);

	return (
		<ListContext.Provider value={{ isFull: tasks.length >= 200 }}>
			<Container
				orientation="row"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				width="fill"
				height="fill"
				background="gray5"
				borderRadius="none"
				maxHeight="100%"
			>
				<Responsive mode="desktop">
					<TaskList tasks={tasks} />
					<Container
						width={DISPLAYER_WIDTH}
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						borderRadius="none"
						style={{ maxHeight: '100%' }}
					>
						<Displayer translationKey="displayer.allTasks" />
					</Container>
				</Responsive>
				<Responsive mode="mobile">
					<TaskList tasks={tasks} />
				</Responsive>
			</Container>
		</ListContext.Provider>
	);
};
