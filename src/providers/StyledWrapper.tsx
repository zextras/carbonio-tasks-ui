/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { ThemeProvider } from '@zextras/carbonio-design-system';

type StyledWrapperProps = {
	children?: React.ReactNode;
};

export const StyledWrapper = ({ children }: StyledWrapperProps): React.JSX.Element => (
	<ThemeProvider loadDefaultFont={false}>{children}</ThemeProvider>
);
