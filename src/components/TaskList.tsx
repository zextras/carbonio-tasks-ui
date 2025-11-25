/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import styled from '@emotion/styled';
import {
	Text,
	Container,
	Divider,
	ListItem,
	type ListItemProps,
	List,
	pseudoClasses,
	Row,
	type AnyColor
} from '@zextras/carbonio-design-system';
import { isEmpty, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ListItemContent } from './ListItemContent';
import { LIST_WIDTH } from '../constants';
import type { FindTasksQuery } from '../gql/types';
import { useActiveItem } from '../hooks/useActiveItem';
import { useRandomPlaceholder } from '../hooks/useRandomPlaceholder';
import type { NonNullableList } from '../types/utils';

type TaskListProps = {
	tasks: NonNullableList<FindTasksQuery['findTasks']>;
};

const StyledListItem = styled(ListItem)<{
	$backgroundColor?: AnyColor;
}>`
	${({ $backgroundColor, theme }): undefined | ReturnType<typeof pseudoClasses> | string =>
		$backgroundColor && pseudoClasses(theme, $backgroundColor, 'color')}
	transition: none;
`;

const CustomListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
	function CustomListItemFn(props, ref) {
		return (
			<StyledListItem
				ref={ref}
				$backgroundColor={
					(props.active && props.activeBackground) ||
					(props.selected && props.selectedBackground) ||
					props.background
				}
				{...props}
			/>
		);
	}
);

export const TaskList = ({ tasks }: TaskListProps): React.JSX.Element => {
	const [t] = useTranslation();
	const allTasksLabel = useMemo(() => t('secondaryBar.allTasks', 'All Tasks'), [t]);
	const { activeItem, setActive } = useActiveItem();
	const [emptyListPlaceholder] = useRandomPlaceholder<string>('list.empty', {
		defaultValue: "It looks like there's nothing here."
	});

	const items = useMemo(
		() =>
			map(tasks, (task) => (
				<CustomListItem key={task.id} active={task.id === activeItem} data-testid={'list-item'}>
					{(visible): React.JSX.Element => (
						<ListItemContent
							visible={visible}
							title={task.title}
							priority={task.priority}
							reminderAt={task.reminderAt}
							reminderAllDay={task.reminderAllDay}
							status={task.status}
							id={task.id}
							onClick={setActive}
						/>
					)}
				</CustomListItem>
			)),
		[activeItem, setActive, tasks]
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
			>
				<Text lineHeight={1.5}>{allTasksLabel}</Text>
			</Row>
			<Divider color="gray3" />
			<Container minHeight={0} maxHeight={'100%'}>
				{(!isEmpty(items) && (
					<List data-testid="main-list" background={'gray6'}>
						{items}
					</List>
				)) || (
					<Text
						size={'small'}
						weight={'bold'}
						overflow={'break-word'}
						color={'secondary'}
						textAlign={'center'}
						lineHeight={1.5}
					>
						{emptyListPlaceholder}
					</Text>
				)}
			</Container>
		</Container>
	);
};
