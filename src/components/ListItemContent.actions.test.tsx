/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { ListItemContent } from './ListItemContent';
import { ICON_REGEXP } from '../constants/tests';
import { populateTask } from '../mocks/utils';
import { setup } from '../utils/testUtils';

describe('List item content', () => {
	describe('Actions', () => {
		describe('Complete', () => {
			test('Is visible on hover', () => {
				const task = populateTask();
				const { queryByRoleWithIcon, getByRoleWithIcon } = setup(
					<ListItemContent id={task.id} priority={task.priority} title={task.title} />
				);
				expect(
					queryByRoleWithIcon('button', { icon: ICON_REGEXP.completeAction })
				).not.toBeInTheDocument();
			});
		});
	});
});
