/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Spinner as SpinnerDS } from '@zextras/carbonio-design-system';

export const Spinner = (): React.JSX.Element => (
	<Container width="fill" height="fill" mainAlignment="center" crossAlignment="center">
		<SpinnerDS color={'primary'} />
	</Container>
);
