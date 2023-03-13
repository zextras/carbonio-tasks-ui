/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen, within } from '@testing-library/react';

import { ListItemContent } from './ListItemContent';
import { ICON_REGEXP, TEST_ID_SELECTOR } from '../constants/tests';
import { Priority } from '../gql/types';
import { populateTask } from '../mocks/utils';
import { setup } from '../utils/testUtils';

describe('List item content', () => {
	describe('Actions', () => {
		test('Hover bar is not rendered if item is not visible', () => {
			const task = populateTask();
			setup(
				<ListItemContent id={task.id} priority={task.priority} title={task.title} visible={false} />
			);
			expect(screen.queryByTestId(TEST_ID_SELECTOR.hoverBar)).not.toBeInTheDocument();
		});

		test('Only one contextual menu is visible for multiple right click', async () => {
			const task = populateTask();
			task.priority = Priority.Medium;
			const { user } = setup(
				<ListItemContent id={task.id} priority={task.priority} title={task.title} visible />
			);
			await user.rightClick(screen.getByText(task.title));
			await screen.findByTestId(TEST_ID_SELECTOR.dropdown);
			expect(screen.getByTestId(TEST_ID_SELECTOR.dropdown)).toBeVisible();
			await user.rightClick(screen.getByTestId(ICON_REGEXP.mediumPriority));
			await screen.findByTestId(TEST_ID_SELECTOR.dropdown);
			// still only one dropdown visible
			expect(screen.getByTestId(TEST_ID_SELECTOR.dropdown)).toBeVisible();
		});

		test('Contextual menu is closed on left click on the item', async () => {
			const task = populateTask();
			task.priority = Priority.Medium;
			const { user } = setup(
				<ListItemContent id={task.id} priority={task.priority} title={task.title} visible />
			);
			await user.rightClick(screen.getByText(task.title));
			await screen.findByTestId(TEST_ID_SELECTOR.dropdown);
			expect(screen.getByTestId(TEST_ID_SELECTOR.dropdown)).toBeVisible();
			await user.click(screen.getByTestId(ICON_REGEXP.mediumPriority));
			expect(screen.queryByTestId(TEST_ID_SELECTOR.dropdown)).not.toBeInTheDocument();
		});

		describe('Complete', () => {
			test('Is visible on hover', async () => {
				const task = populateTask();
				setup(<ListItemContent id={task.id} priority={task.priority} title={task.title} visible />);

				// rtl isVisible is not working on hover bar
				// Check that the action is inside the hover bar
				expect(screen.getByTestId(ICON_REGEXP.completeAction)).toBeInTheDocument();
				expect(
					within(screen.getByTestId(TEST_ID_SELECTOR.hoverBar)).getByTestId(
						ICON_REGEXP.completeAction
					)
				).toBeInTheDocument();
			});

			test('Is visible in contextual menu', async () => {
				const task = populateTask();
				const { user } = setup(
					<ListItemContent id={task.id} priority={task.priority} title={task.title} visible />
				);

				await user.rightClick(screen.getByText(task.title));
				const dropdown = await screen.findByTestId(TEST_ID_SELECTOR.dropdown);
				expect(screen.getByText('Complete')).toBeVisible();
				expect(within(dropdown).getByTestId(ICON_REGEXP.completeAction)).toBeVisible();
			});
		});

		describe('Edit', () => {
			test('Is visible on hover', async () => {
				const task = populateTask();
				setup(<ListItemContent id={task.id} priority={task.priority} title={task.title} visible />);

				// rtl isVisible is not working on hover bar
				// Check that the action is inside the hover bar
				expect(screen.getByTestId(ICON_REGEXP.editAction)).toBeInTheDocument();
				expect(
					within(screen.getByTestId(TEST_ID_SELECTOR.hoverBar)).getByTestId(ICON_REGEXP.editAction)
				).toBeInTheDocument();
			});

			test('Is visible in contextual menu', async () => {
				const task = populateTask();
				const { user } = setup(
					<ListItemContent id={task.id} priority={task.priority} title={task.title} visible />
				);

				await user.rightClick(screen.getByText(task.title));
				const dropdown = await screen.findByTestId(TEST_ID_SELECTOR.dropdown);
				expect(screen.getByText('Edit')).toBeVisible();
				expect(within(dropdown).getByTestId(ICON_REGEXP.editAction)).toBeVisible();
			});
		});
	});
});
