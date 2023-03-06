/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable no-var,vars-on-top */

import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

declare global {
	var apolloClient: ApolloClient<NormalizedCacheObject>;
}
