/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ApolloClient, HttpLink, InMemoryCache, type NormalizedCacheObject } from '@apollo/client';

import { typePolicies } from './typePolicies';
import { GRAPHQL_ENDPOINT } from '../constants';
import introspection from '../gql/possible-types';

const cache = new InMemoryCache({
	possibleTypes: introspection.possibleTypes,
	typePolicies
});

let apolloClient: ApolloClient<NormalizedCacheObject>;

const buildClient: () => ApolloClient<NormalizedCacheObject> = () => {
	const uri = process.env.NODE_ENV === 'test' ? 'http://localhost:9000' : '';
	if (apolloClient == null) {
		const httpLink = new HttpLink({
			uri: `${uri}${GRAPHQL_ENDPOINT}`,
			credentials: 'same-origin'
		});

		apolloClient = new ApolloClient<NormalizedCacheObject>({
			cache,
			connectToDevTools: process.env.NODE_ENV !== 'production',
			link: httpLink
		});
	}
	return apolloClient;
};

export default buildClient;
