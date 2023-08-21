/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import {
	Container,
	Divider,
	getColor,
	ListItem,
	type ListItemProps,
	ListV2,
	pseudoClasses,
	Row
} from '@zextras/carbonio-design-system';
import { isEmpty, map } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled, { css, type DefaultTheme, type SimpleInterpolation } from 'styled-components';

import { ListItemContent } from './ListItemContent';
import { HoverBarContainer } from './StyledComponents';
import { Text } from './Text';
import { LIST_WIDTH } from '../constants';
import type { FindTasksQuery } from '../gql/types';
import { useActiveItem } from '../hooks/useActiveItem';
import { useRandomPlaceholder } from '../hooks/useRandomPlaceholder';
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

	${({ backgroundColor, theme }): SimpleInterpolation =>
		backgroundColor &&
		css`
			${HoverBarContainer} {
				background: linear-gradient(to right, transparent, ${getColor(backgroundColor, theme)});
			}
			&:focus ${HoverBarContainer} {
				background: linear-gradient(
					to right,
					transparent,
					${getColor(`${backgroundColor}.focus`, theme)}
				);
			}

			&:hover ${HoverBarContainer} {
				background: linear-gradient(
					to right,
					transparent,
					${getColor(`${backgroundColor}.hover`, theme)}
				);
			}

			&:active ${HoverBarContainer} {
				background: linear-gradient(
					to right,
					transparent,
					${getColor(`${backgroundColor}.active`, theme)}
				);
			}
		`}
`;

export const TaskList = ({ tasks }: TaskListProps): React.JSX.Element => {
	const [t] = useTranslation();
	const allTasksLabel = useMemo(() => t('secondaryBar.allTasks', 'All Tasks'), [t]);
	const { activeItem, setActive } = useActiveItem();
	const [emptyListPlaceholder] = useRandomPlaceholder('list.empty', {
		defaultValue: "It looks like there's nothing here."
	});

	const items = useMemo(
		() =>
			map(tasks, (task) => (
				<StyledListItem key={task.id} active={task.id === activeItem} data-testid={'list-item'}>
					{(visible): React.JSX.Element => (
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
				gap="medium"
			>
				<Text>{allTasksLabel}</Text>
			</Row>
			<Divider color="gray3" />
			<Container minHeight={0} maxHeight={'100%'}>
				{(!isEmpty(items) && <ListV2 background={'gray6'}>{items}</ListV2>) || (
					<Text size={'small'} weight={'bold'} overflow={'break-word'} color={'secondary'} centered>
						{emptyListPlaceholder}
					</Text>
				)}
			</Container>
		</Container>
	);
};
