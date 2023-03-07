/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { ApolloProvider } from '@apollo/client';
import { ModalManager, SnackbarManager } from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/carbonio-shell-ui';

import { StyledWrapper } from './StyledWrapper';
import buildClient from '../apollo';
import { TimeZoneContext } from '../contexts';

export const ProvidersWrapper: React.FC = ({ children }) => {
	const apolloClient = useMemo(() => buildClient(), []);
	const settings = useUserSettings();
	const timeZoneId = useMemo(() => settings.prefs.zimbraPrefTimeZoneId as string, [settings]);
	return (
		<StyledWrapper>
			<ApolloProvider client={apolloClient}>
				<SnackbarManager>
					<ModalManager>
						<TimeZoneContext.Provider value={timeZoneId}>{children}</TimeZoneContext.Provider>
					</ModalManager>
				</SnackbarManager>
			</ApolloProvider>
		</StyledWrapper>
	);
};
