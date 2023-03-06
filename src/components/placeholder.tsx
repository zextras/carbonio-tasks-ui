/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Text } from '@zextras/carbonio-design-system';
import { map } from 'lodash';

export const Placeholder = (props: object): JSX.Element => (
	<Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ all: 'medium' }}>
		<Text weight={'bold'} size={'large'}>
			Placeholder Component
		</Text>
		<Text>Received props:</Text>
		{map(props, (p, k) => (
			<Text>{`${k}: ${p}`}</Text>
		))}
	</Container>
);
