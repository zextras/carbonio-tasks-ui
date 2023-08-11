/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { ApolloProvider } from '@apollo/client';
import { ModalManager } from '@zextras/carbonio-design-system';

import { StyledWrapper } from './StyledWrapper';
import buildClient from '../apollo';
import { SnackbarStackManager } from '../components/SnackbarStackManager';
import { type OneOrMany } from '../types/utils';

interface ProvidersWrapperProps {
	children?: OneOrMany<React.ReactNode>;
}

export const ManagersProvider = ({ children }: ProvidersWrapperProps): React.JSX.Element => (
	<SnackbarStackManager>
		<ModalManager>{children}</ModalManager>
	</SnackbarStackManager>
);

export const ProvidersWrapper = ({ children }: ProvidersWrapperProps): React.JSX.Element => {
	const apolloClient = useMemo(() => buildClient(), []);

	return (
		<StyledWrapper>
			<ApolloProvider client={apolloClient}>
				<ManagersProvider>{children}</ManagersProvider>
			</ApolloProvider>
		</StyledWrapper>
	);
};
