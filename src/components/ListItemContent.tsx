/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Container, Icon, Row } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { ContextualMenu } from './ContextualMenu';
import { ListItemHoverBar } from './ListItemHoverBar';
import { PriorityIcon } from './PriorityIcon';
import { Reminder } from './Reminder';
import { HoverContainer, ListItemContainer } from './StyledComponents';
import { TextExtended as Text } from './Text';
import { LIST_ITEM_HEIGHT } from '../constants';
import type { Task } from '../gql/types';
import { useReminder } from '../hooks/useReminder';

type ListItemContentProps = Pick<
	Task,
	'id' | 'priority' | 'reminderAt' | 'reminderAllDay' | 'title'
> & {
	visible?: boolean;
	active?: boolean;
	onClick?: (id: string) => void;
};

export const ListItemContent = React.memo<ListItemContentProps>(
	({
		id,
		priority,
		reminderAt,
		title,
		reminderAllDay,
		onClick,
		// others props
		visible
	}) => {
		const [t] = useTranslation();
		const { isExpired: isReminderExpired } = useReminder(reminderAt, reminderAllDay);

		const clickHandler = useCallback<React.MouseEventHandler<HTMLDivElement>>(() => {
			onClick?.(id);
		}, [id, onClick]);

		const missingReminderLabel = useMemo(
			() => t('tasksListItem.reminder.doNotRemindMe', 'Do not remind me'),
			[t]
		);

		const preventTextSelection = useCallback<React.MouseEventHandler<HTMLDivElement>>((e) => {
			if (e.detail > 1) {
				e.preventDefault();
			}
		}, []);

		return visible ? (
			<Container data-testid={id}>
				<ContextualMenu actions={[]}>
					<ListItemContainer
						height={'fit'}
						crossAlignment={'flex-end'}
						onMouseDown={preventTextSelection}
						onClick={clickHandler}
					>
						<HoverContainer
							height={LIST_ITEM_HEIGHT}
							wrap="nowrap"
							mainAlignment="flex-start"
							crossAlignment="center"
							padding={{ all: 'small' }}
							width="fill"
							gap={'1rem'}
						>
							<Container orientation="vertical" height={'auto'} gap={'0.25rem'} width="fill">
								<Row gap={'0.25rem'} width="fill" wrap="nowrap" mainAlignment="space-between">
									<Text overflow="ellipsis" size="medium">
										{title}
									</Text>
									<Container width={'fit'} height={'fit'} flexShrink={0}>
										<PriorityIcon priority={priority} />
									</Container>
								</Row>
								<Row gap={'0.25rem'} width="fill" wrap="nowrap" mainAlignment="space-between">
									<Container
										flexShrink={0}
										flexGrow={1}
										flexBasis="auto"
										mainAlignment="flex-start"
										orientation="horizontal"
										width="fit"
										height={'auto'}
									>
										{reminderAt ? (
											<>
												<Text size="small">
													{t('tasksListItem.reminder.remindMeOn', 'Remind me on')}&nbsp;
												</Text>
												<Reminder reminderAt={reminderAt} reminderAllDay={reminderAllDay} />
											</>
										) : (
											<Text color="secondary" size="small">
												{missingReminderLabel}
											</Text>
										)}
									</Container>
									{isReminderExpired && (
										<Container width={'fit'} height={'fit'} flexShrink={0}>
											<Icon icon="AlertTriangle" color="warning" />
										</Container>
									)}
								</Row>
							</Container>
						</HoverContainer>
						{<ListItemHoverBar actions={[]} />}
					</ListItemContainer>
				</ContextualMenu>
			</Container>
		) : (
			<div style={{ height: LIST_ITEM_HEIGHT }} />
		);
	}
);

ListItemContent.displayName = 'ListItemContent';
