/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';
import { ProvidersWrapper } from '../../providers/ProvidersWrapper';
import { TasksView } from './TasksView';

const AppView: React.VFC = () => (
	<ProvidersWrapper>
		<TasksView />
	</ProvidersWrapper>
);

export default AppView;
