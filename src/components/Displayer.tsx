/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { EmptyDisplayer } from './EmptyDisplayer';

export interface DisplayerProps {
	translationKey: string;
}

export const Displayer: React.VFC<DisplayerProps> = ({ translationKey }) => (
	<Container
		orientation="vertical"
		mainAlignment="flex-start"
		crossAlignment="flex-start"
		data-testid="displayer"
	>
		<EmptyDisplayer translationKey={translationKey} />
	</Container>
);
