/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { trimEnd } from 'lodash';
import { Route, useRouteMatch } from 'react-router-dom';

import { TasksView } from './TasksView';
import { ROUTES } from '../../constants';
import { ProvidersWrapper } from '../../providers/ProvidersWrapper';

const AppView = (): React.JSX.Element => {
	const { path } = useRouteMatch();

	const routes = useMemo(
		() => <Route path={`${trimEnd(path, '/')}${ROUTES.task}`} component={TasksView} />,
		[path]
	);

	return <ProvidersWrapper>{routes}</ProvidersWrapper>;
};

export default AppView;
