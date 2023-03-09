/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, screen } from '@testing-library/react';

import { DisplayerHeader } from './DisplayerHeader';
import { ICON_REGEXP, TEST_ID_SELECTOR } from '../constants/tests';
import { setup } from '../utils/testUtils';

describe('Displayer header', () => {
	test('Show the title', () => {
		const title = faker.lorem.words();
		setup(<DisplayerHeader title={title} />);
		expect(screen.getByText(title)).toBeVisible();
	});

	test('Ellipse long title and show tooltip on hover', async () => {
		const title = faker.lorem.sentences(20);
		const { user } = setup(<DisplayerHeader title={title} />);
		const titleElement = screen.getByText(title);
		expect(titleElement).toBeVisible();
		// register listeners of tooltip
		act(() => {
			jest.runOnlyPendingTimers();
		});
		// simulate a text with a scroll width greater than the client width
		jest.spyOn(titleElement, 'clientWidth', 'get').mockReturnValue(300);
		jest.spyOn(titleElement, 'scrollWidth', 'get').mockReturnValue(500);
		await user.hover(screen.getByText(title));
		await screen.findByTestId(TEST_ID_SELECTOR.tooltip);
		expect(screen.getAllByText(title)).toHaveLength(2);
	});

	test('Show close action to close displayer', () => {
		const { getByRoleWithIcon } = setup(<DisplayerHeader title={faker.lorem.words()} />);
		expect(getByRoleWithIcon('button', { icon: ICON_REGEXP.close })).toBeVisible();
		expect(getByRoleWithIcon('button', { icon: ICON_REGEXP.close })).toBeEnabled();
	});
});
