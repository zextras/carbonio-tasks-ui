/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { lazy, Suspense, useEffect } from 'react';

import {
	ACTION_TYPES,
	addBoard,
	addBoardView,
	addRoute,
	registerActions,
	type SecondaryBarComponentProps,
	Spinner
} from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { Placeholder } from './components/placeholder';
import { TASKS_APP_ID, TASKS_ROUTE } from './constants';

const LazyAppView = lazy(() => import(/* webpackChunkName: "appView" */ './views/app/AppView'));

const LazySecondaryBarView = lazy(
	() => import(/* webpackChunkName: "secondaryView" */ './views/secondary-bar/SecondaryBarView')
);

const AppView = (): JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<LazyAppView />
	</Suspense>
);

const SecondaryBarView = (props: SecondaryBarComponentProps): JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<LazySecondaryBarView {...props} />
	</Suspense>
);

const App = (): React.ReactNode => {
	const [t] = useTranslation();
	useEffect(() => {
		const appNameLabel = t('label.app_name', 'Tasks');

		addRoute({
			route: TASKS_ROUTE,
			position: 10,
			visible: true,
			label: appNameLabel,
			primaryBar: 'ListViewOutline',
			secondaryBar: SecondaryBarView,
			appView: AppView
		});

		// boards
		addBoardView({
			route: TASKS_ROUTE,
			component: Placeholder
		});
	}, [t]);

	useEffect(() => {
		// create button actions
		registerActions({
			id: 'new-task',
			type: ACTION_TYPES.NEW,
			action: () => ({
				id: 'new-task',
				label: t('label.new', 'New Task'),
				icon: 'ListViewOutline',
				click: (): void => {
					addBoard({ url: TASKS_ROUTE, title: 'Main Board' });
				},
				disabled: false,
				primary: true,
				group: TASKS_APP_ID
			})
		});
	}, [t]);

	return null;
};

export default App;
