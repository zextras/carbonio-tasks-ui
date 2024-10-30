/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';

import App from './app';
import { setup } from './utils/testUtils';

jest.mock('./AuthenticatedApp', () => ({
	AuthenticatedApp: (): React.JSX.Element => (
		<div data-testid="authenticated-app">Authenticated Content</div>
	)
}));

it('should render AuthenticatedApp if the user is authenticated', () => {
	setup(<App />);
	expect(screen.getByTestId('authenticated-app')).toBeVisible();
	expect(screen.getByText(/authenticated content/i)).toBeVisible();
});

it('should not render AuthenticatedApp if the user is not authenticated', () => {
	jest.spyOn(shell, 'useAuthenticated').mockReturnValue(false);
	setup(<App />);
	expect(screen.queryByTestId('authenticated-app')).not.toBeInTheDocument();
	expect(screen.queryByText(/authenticated content/i)).not.toBeInTheDocument();
});
