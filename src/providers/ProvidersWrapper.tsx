/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { ApolloProvider } from '@apollo/client';
import { ModalManager, SnackbarManager } from '@zextras/carbonio-design-system';
import buildClient from '../apollo';
import { StyledWrapper } from './StyledWrapper';

export const ProvidersWrapper: React.FC = ({ children }) => {
	const apolloClient = useMemo(() => buildClient(), []);
	return (
		<StyledWrapper>
			<ApolloProvider client={apolloClient}>
				<SnackbarManager>
					<ModalManager>{children}</ModalManager>
				</SnackbarManager>
			</ApolloProvider>
		</StyledWrapper>
	);
};
