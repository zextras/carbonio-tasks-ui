/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import {
	Container,
	Divider,
	ListItem,
	type ListItemProps,
	ListV2,
	pseudoClasses,
	Row,
	Text
} from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled, { type DefaultTheme, type SimpleInterpolation } from 'styled-components';

import { ListItemContent } from './ListItemContent';
import { LIST_WIDTH } from '../constants';
import type { FindTasksQuery } from '../gql/types';
import { useActiveItem } from '../hooks/useActiveItem';
import type { NonNullableList } from '../types/utils';

type TaskListProps = {
	tasks: NonNullableList<FindTasksQuery['findTasks']>;
};

const StyledListItem = styled(ListItem).attrs<
	ListItemProps,
	{ backgroundColor?: string | keyof DefaultTheme['palette'] }
>(({ background, selectedBackground, activeBackground, active, selected }) => ({
	backgroundColor: (active && activeBackground) || (selected && selectedBackground) || background
}))`
	${({ backgroundColor, theme }): SimpleInterpolation =>
		backgroundColor && pseudoClasses(theme, backgroundColor, 'color')}
	transition: none;
`;

export const TaskList = ({ tasks }: TaskListProps): JSX.Element => {
	const [t] = useTranslation();
	const allTasksLabel = useMemo(() => t('secondaryBar.allTasks', 'All Tasks'), [t]);
	const { isActive, setActive } = useActiveItem();

	const items = useMemo(
		() =>
			map(tasks, (task) => (
				<StyledListItem key={task.id} active={isActive(task.id)}>
					{(visible): JSX.Element => (
						<ListItemContent
							visible={visible}
							title={task.title}
							priority={task.priority}
							reminderAt={task.reminderAt}
							reminderAllDay={task.reminderAllDay}
							id={task.id}
							onClick={setActive}
						/>
					)}
				</StyledListItem>
			)),
		[isActive, setActive, tasks]
	);

	return (
		<Container
			width={LIST_WIDTH}
			mainAlignment="flex-start"
			crossAlignment="unset"
			borderRadius="none"
			background={'gray6'}
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
			<ListV2 background={'gray6'}>{items}</ListV2>
		</Container>
	);
};
