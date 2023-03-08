/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Divider, IconButton } from '@zextras/carbonio-design-system';

import { TextExtended as Text } from './Text';
import { useActiveItem } from '../hooks/useActiveItem';

interface DisplayerHeaderProps {
	title: string;
}

export const DisplayerHeader = ({ title }: DisplayerHeaderProps): JSX.Element => {
	const { removeActive } = useActiveItem();

	return (
		<Container orientation={'vertical'} width={'fill'} height={'auto'}>
			<Container
				orientation={'horizontal'}
				width={'fill'}
				height={'auto'}
				mainAlignment={'space-between'}
				padding={{ top: '0.5rem', right: '0.5rem', bottom: '0.5rem', left: '1rem' }}
				gap={'0.5rem'}
			>
				<Text withTooltip>{title}</Text>
				<IconButton icon={'CloseOutline'} size={'medium'} onClick={removeActive} />
			</Container>
			<Divider color={'gray3'} />
		</Container>
	);
};
