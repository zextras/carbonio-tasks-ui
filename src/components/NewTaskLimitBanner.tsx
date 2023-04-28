/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Divider, Icon } from '@zextras/carbonio-design-system';

import { Text } from './Text';

export interface NewTaskLimitBannerProps {
	bannerLabel: string;
	bannerColor: string;
	bannerIcon: string;
}

export const NewTaskLimitBanner = ({
	bannerLabel,
	bannerColor,
	bannerIcon
}: NewTaskLimitBannerProps): JSX.Element => (
	<>
		<Container
			background={'gray6'}
			mainAlignment={'flex-start'}
			crossAlignment={'center'}
			padding={{ horizontal: 'large', vertical: 'small' }}
			orientation={'horizontal'}
			height={'fit'}
			gap={'1rem'}
		>
			<Icon icon={bannerIcon} color={bannerColor} size={'large'} />
			<Text size={'extrasmall'}>{bannerLabel}</Text>
		</Container>
		<Divider color={bannerColor} />
	</>
);
