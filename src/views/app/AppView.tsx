/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { Route, useRouteMatch } from 'react-router-dom';

import { TasksView } from './TasksView';
import { ProvidersWrapper } from '../../providers/ProvidersWrapper';

const AppView = (): JSX.Element => {
	const { path } = useRouteMatch();
	const routes = useMemo(() => <Route path={`${path}/:taskId?`} component={TasksView} />, [path]);

	return <ProvidersWrapper>{routes}</ProvidersWrapper>;
};

export default AppView;
