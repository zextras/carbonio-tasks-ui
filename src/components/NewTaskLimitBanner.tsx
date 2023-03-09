/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Divider, Icon } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { TextExtended as Text } from './Text';

export const NewTaskLimitBanner = (): JSX.Element => {
	const [t] = useTranslation();

	return (
		<>
			<Container
				background="gray6"
				mainAlignment="flex-start"
				crossAlignment="center"
				padding={{ horizontal: 'large', vertical: 'small' }}
				orientation={'horizontal'}
				height={'fit'}
				gap={'1rem'}
			>
				<Icon icon="InfoOutline" color="info" size={'large'} />
				<Text size={'extrasmall'}>
					{t(
						'newTaskBoard.banner.lastTask',
						'This is the last task you can create. To create more complete your previous tasks.'
					)}
				</Text>
			</Container>
			<Divider color={'info'} />
		</>
	);
};
