/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { PriorityIcon } from './PriorityIcon';
import { ICON_REGEXP } from '../constants/tests';
import { Priority } from '../gql/types';
import { setup } from '../utils/testUtils';

describe('Priority icon', () => {
	test('Render high priority icon', () => {
		setup(<PriorityIcon priority={Priority.High} />);
		expect(screen.getByTestId(ICON_REGEXP.highPriority)).toBeVisible();
	});

	test('Render low priority icon', () => {
		setup(<PriorityIcon priority={Priority.Low} />);
		expect(screen.getByTestId(ICON_REGEXP.lowPriority)).toBeVisible();
	});

	test('Render medium priority icon', () => {
		setup(<PriorityIcon priority={Priority.Medium} />);
		expect(screen.getByTestId(ICON_REGEXP.mediumPriority)).toBeVisible();
	});

	test('Render nothing if invalid priority is provided', () => {
		const { container } = setup(<PriorityIcon priority={'invalid' as Priority} />);
		expect(screen.queryByTestId(ICON_REGEXP.highPriority)).not.toBeInTheDocument();
		expect(screen.queryByTestId(ICON_REGEXP.lowPriority)).not.toBeInTheDocument();
		expect(screen.queryByTestId(ICON_REGEXP.mediumPriority)).not.toBeInTheDocument();
		expect(container).toBeEmptyDOMElement();
	});
});
