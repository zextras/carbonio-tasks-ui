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
import { Status } from '../gql/types';
import { setup } from '../utils/testUtils';

describe('Displayer header', () => {
	test('Checkmark is visible when status is Complete', () => {
		const title = faker.lorem.words();
		setup(<DisplayerHeader title={title} status={Status.Complete} />);
		expect(screen.getByTestId(ICON_REGEXP.reminderComplete)).toBeVisible();
	});
	test('Checkmark is not in the document when status is Open', () => {
		const title = faker.lorem.words();
		setup(<DisplayerHeader title={title} status={Status.Open} />);
		expect(screen.queryByTestId(ICON_REGEXP.reminderComplete)).not.toBeInTheDocument();
	});
	test.each([[Status.Open], [Status.Complete]])('Show the title when status is %s', (status) => {
		const title = faker.lorem.words();
		setup(<DisplayerHeader title={title} status={status} />);
		expect(screen.getByText(title)).toBeVisible();
	});

	test.each([[Status.Open], [Status.Complete]])(
		'Ellipse long title and show tooltip on hover when status is %s',
		async (status) => {
			const title = faker.lorem.sentences(20);
			const { user } = setup(<DisplayerHeader title={title} status={status} />);
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
		}
	);

	test.each([[Status.Open], [Status.Complete]])(
		'Show close action to close displayer when status is %s',
		(status) => {
			const { getByRoleWithIcon } = setup(
				<DisplayerHeader title={faker.lorem.words()} status={status} />
			);
			expect(getByRoleWithIcon('button', { icon: ICON_REGEXP.closeDisplayer })).toBeVisible();
			expect(getByRoleWithIcon('button', { icon: ICON_REGEXP.closeDisplayer })).toBeEnabled();
		}
	);
});
