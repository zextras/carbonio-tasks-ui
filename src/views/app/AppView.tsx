/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Route, Routes } from 'react-router-dom';

import { TasksView } from './TasksView';
import { ROUTES } from '../../constants';
import { ProvidersWrapper } from '../../providers/ProvidersWrapper';

const AppView = (): React.JSX.Element => (
	<ProvidersWrapper>
		<Routes>
			<Route path={ROUTES.task} element={<TasksView />} />
		</Routes>
	</ProvidersWrapper>
);

export default AppView;
