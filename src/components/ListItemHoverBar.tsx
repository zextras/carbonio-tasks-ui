/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { type Action as DSAction, CollapsingActions } from '@zextras/carbonio-design-system';
import { map } from 'lodash';

import { HoverBarContainer } from './StyledComponents';

interface ListItemHoverBarProps extends React.ComponentPropsWithoutRef<typeof HoverBarContainer> {
	actions?: DSAction[];
}

export const ListItemHoverBar = ({ actions, ...rest }: ListItemHoverBarProps): JSX.Element => {
	const actionsMapped = useMemo(
		() =>
			map(actions, (action) => ({
				...action,
				onClick: (event: Parameters<DSAction['onClick']>[0]): ReturnType<DSAction['onClick']> => {
					event.stopPropagation();
					action.onClick(event);
				}
			})),
		[actions]
	);

	return (
		<HoverBarContainer
			wrap="nowrap"
			mainAlignment="flex-end"
			data-testid="hover-bar"
			padding={{ top: '0.5rem', right: '0.5rem' }}
			width={'100%'}
			height={'45%'}
			{...rest}
		>
			<CollapsingActions actions={actionsMapped} color={'text'} size={'small'} gap={'0.5rem'} />
		</HoverBarContainer>
	);
};
