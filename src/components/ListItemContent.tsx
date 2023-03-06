/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Container, Icon, Padding, Row } from '@zextras/carbonio-design-system';
import moment from 'moment-timezone';
import { useTranslation } from 'react-i18next';

import { ContextualMenu } from './ContextualMenu';
import { NodeHoverBar } from './NodeHoverBar';
import { Reminder } from './Reminder';
import { HoverContainer, ListItemContainer, TextWithLineHeight } from './StyledComponents';
import { LIST_ITEM_HEIGHT } from '../constants';
import { Priority, Task } from '../gql/types';

type ListItemContentProps = Pick<
	Task,
	'id' | 'priority' | 'reminderAt' | 'reminderAllDay' | 'title'
> & {
	visible?: boolean;
	active?: boolean;
	onClick?: () => void;
	disabled?: boolean;
	timeZoneId: string;
};

export const ListItemContent = React.memo<ListItemContentProps>(
	({
		id,
		priority,
		reminderAt,
		title,
		reminderAllDay,
		// others props
		visible,
		active,
		disabled = false,
		timeZoneId
	}) => {
		const [t] = useTranslation();

		const clickHandler = useCallback(() => {
			// onClick(id);
		}, []);

		const missingReminderLabel = useMemo(
			() => t('tasksListItem.reminder.doNotRemindMe', 'Do not remind me'),
			[t]
		);

		const isReminderExpired = useMemo(() => {
			if (reminderAt) {
				const now = moment().tz(timeZoneId);
				if (reminderAllDay) {
					return moment(reminderAt).isBefore(now, 'day');
				}

				return moment(reminderAt).isBefore(now);
			}
			return false;
		}, [reminderAllDay, reminderAt, timeZoneId]);

		const preventTextSelection = useCallback<React.MouseEventHandler>((e): void => {
			if (e.detail > 1) {
				e.preventDefault();
			}
		}, []);

		return visible ? (
			<Container data-testid={id}>
				<ContextualMenu actions={[]}>
					<ListItemContainer
						height={'fit'}
						data-testid={`node-item-${id}`}
						crossAlignment={'flex-end'}
						$contextualMenuActive={false}
						$disableHover={disabled}
						$disabled={disabled}
						onMouseDown={preventTextSelection}
					>
						<HoverContainer
							height={LIST_ITEM_HEIGHT}
							wrap="nowrap"
							mainAlignment="flex-start"
							crossAlignment="center"
							padding={{ all: 'small' }}
							width="fill"
							background={active ? 'highlight' : 'gray6'}
						>
							<Container
								orientation="vertical"
								crossAlignment="flex-start"
								mainAlignment="space-around"
								padding={{ right: 'small', left: 'small' }}
								minWidth="auto"
								width="fill"
							>
								<Row
									padding={{ vertical: 'extrasmall' }}
									width="fill"
									wrap="nowrap"
									mainAlignment="space-between"
								>
									<TextWithLineHeight overflow="ellipsis" disabled={disabled} size="medium">
										{title}
									</TextWithLineHeight>
									<Container orientation="horizontal" mainAlignment="flex-end" width="fit">
										<Padding left="extrasmall">
											{priority === Priority.High && (
												<Icon icon="ArrowheadUp" color="error" disabled={disabled} />
											)}
											{priority === Priority.Low && (
												<Icon icon="ArrowheadDown" color="info" disabled={disabled} />
											)}
											{priority === Priority.Medium && (
												<Icon icon="MinusOutline" color="gray1" disabled={disabled} />
											)}
										</Padding>
									</Container>
								</Row>
								<Row
									padding={{ vertical: 'extrasmall' }}
									width="fill"
									wrap="nowrap"
									mainAlignment="flex-start"
								>
									<Container
										flexShrink={0}
										flexGrow={1}
										flexBasis="auto"
										mainAlignment="flex-start"
										orientation="horizontal"
										width="fit"
									>
										{reminderAt ? (
											<Reminder
												timeZoneId={timeZoneId}
												isReminderExpired={isReminderExpired}
												reminderAt={reminderAt}
												reminderAllDay={reminderAllDay}
											/>
										) : (
											<TextWithLineHeight color="secondary" disabled={disabled} size="small">
												{missingReminderLabel}
											</TextWithLineHeight>
										)}
									</Container>
									{isReminderExpired && (
										<Container
											width="fit"
											minWidth={0}
											flexShrink={1}
											flexGrow={1}
											flexBasis="auto"
											orientation="horizontal"
											mainAlignment="flex-end"
											padding={{ left: 'small' }}
										>
											<Padding left="extrasmall">
												<Icon icon="AlertTriangle" color="warning" disabled={disabled} />
											</Padding>
										</Container>
									)}
								</Row>
							</Container>
						</HoverContainer>
						{<NodeHoverBar actions={[]} />}
					</ListItemContainer>
				</ContextualMenu>
			</Container>
		) : (
			<div style={{ height: '4rem' }} />
		);
	}
);

ListItemContent.displayName = 'ListItemContent';
