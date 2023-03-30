/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { ApolloProvider } from '@apollo/client';
import { ModalManager, SnackbarManager } from '@zextras/carbonio-design-system';

import { StyledWrapper } from './StyledWrapper';
import buildClient from '../apollo';
import { type OneOrMany } from '../types/utils';

interface ProvidersWrapperProps {
	children?: OneOrMany<React.ReactNode>;
}

export const ManagersProvider = ({ children }: ProvidersWrapperProps): JSX.Element => (
	<SnackbarManager>
		<ModalManager>{children}</ModalManager>
	</SnackbarManager>
);

export const ProvidersWrapper = ({ children }: ProvidersWrapperProps): JSX.Element => {
	const apolloClient = useMemo(() => buildClient(), []);

	return (
		<StyledWrapper>
			<ApolloProvider client={apolloClient}>
				<ManagersProvider>{children}</ManagersProvider>
			</ApolloProvider>
		</StyledWrapper>
	);
};
