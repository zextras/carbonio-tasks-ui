/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { useAuthenticated } from '@zextras/carbonio-shell-ui';

import { AuthenticatedApp } from './AuthenticatedApp';

const App = (): React.JSX.Element | null => {
	const isAuthenticated = useAuthenticated();

	return isAuthenticated ? <AuthenticatedApp /> : null;
};

export default App;
