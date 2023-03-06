/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { Container, Divider, ListItem, ListV2, Row, Text } from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ListItemContent } from './ListItemContent';
import { LIST_WIDTH } from '../constants';
import { FindTasksQuery } from '../gql/types';
import { NonNullableList } from '../types/utils';

type TaskListProps = {
	tasks: NonNullableList<FindTasksQuery['findTasks']>;
};

export const TaskList = ({ tasks }: TaskListProps): JSX.Element => {
	const settings = useUserSettings();
	const [t] = useTranslation();
	const allTasksLabel = useMemo(() => t('secondaryBar.allTasks', 'All Tasks'), [t]);

	const timeZoneId = useMemo(() => settings.prefs.zimbraPrefTimeZoneId as string, [settings]);

	const items = useMemo(
		() =>
			map(tasks, (task) => (
				<ListItem key={task.id} active={false}>
					{(visible): JSX.Element => (
						<ListItemContent
							active={false}
							visible={visible}
							title={task.title}
							priority={task.priority}
							reminderAt={task.reminderAt || undefined}
							reminderAllDay={task.reminderAllDay || undefined}
							id={task.id}
							timeZoneId={timeZoneId}
						/>
					)}
				</ListItem>
			)),
		[tasks, timeZoneId]
	);

	return (
		<Container
			width={LIST_WIDTH}
			mainAlignment="flex-start"
			crossAlignment="unset"
			borderRadius="none"
			background="gray6"
		>
			<Row
				minHeight={'2.5rem'}
				height="auto"
				background={'gray5'}
				mainAlignment={'space-between'}
				padding={{ left: 'large' }}
				wrap={'nowrap'}
				width={'fill'}
				maxWidth={'100%'}
				data-testid="list-header"
				flexShrink={0}
				flexGrow={1}
				gap="medium"
			>
				<Text>{allTasksLabel}</Text>
			</Row>
			<Divider color="gray3" />
			<ListV2>{items}</ListV2>
		</Container>
	);
};
