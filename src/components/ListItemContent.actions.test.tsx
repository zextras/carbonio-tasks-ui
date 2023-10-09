/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen, within } from '@testing-library/react';

import { ListItemContent } from './ListItemContent';
import { ICON_REGEXP, TEST_ID_SELECTOR } from '../constants/tests';
import { Priority, Status } from '../gql/types';
import { populateTask } from '../mocks/utils';
import { setup } from '../utils/testUtils';

describe('List item content', () => {
	describe('Actions', () => {
		test('Hover bar is not rendered if item is not visible', () => {
			const task = populateTask();
			setup(
				<ListItemContent
					id={task.id}
					priority={task.priority}
					title={task.title}
					visible={false}
					status={Status.Open}
				/>
			);
			expect(screen.queryByTestId(TEST_ID_SELECTOR.hoverBar)).not.toBeInTheDocument();
		});

		test('Only one contextual menu is visible for multiple right click', async () => {
			const task = populateTask();
			task.priority = Priority.Medium;
			const { user } = setup(
				<ListItemContent
					id={task.id}
					priority={task.priority}
					title={task.title}
					visible
					status={Status.Open}
				/>
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
				<ListItemContent
					id={task.id}
					priority={task.priority}
					title={task.title}
					visible
					status={Status.Open}
				/>
			);
			await user.rightClick(screen.getByText(task.title));
			await screen.findByTestId(TEST_ID_SELECTOR.dropdown);
			expect(screen.getByTestId(TEST_ID_SELECTOR.dropdown)).toBeVisible();
			await user.click(screen.getByTestId(ICON_REGEXP.mediumPriority));
			expect(screen.queryByTestId(TEST_ID_SELECTOR.dropdown)).not.toBeInTheDocument();
		});

		describe('Complete', () => {
			test(`When task status is open, complete action is visible on hover`, async () => {
				const task = populateTask();
				setup(
					<ListItemContent
						id={task.id}
						priority={task.priority}
						title={task.title}
						visible
						status={Status.Open}
					/>
				);

				// rtl isVisible is not working on hover bar
				// Check that the action is inside the hover bar
				expect(screen.getByTestId(ICON_REGEXP.completeAction)).toBeInTheDocument();
				expect(
					within(screen.getByTestId(TEST_ID_SELECTOR.hoverBar)).getByTestId(
						ICON_REGEXP.completeAction
					)
				).toBeInTheDocument();
			});
			test(`When task status is complete, complete action is missing on hover`, async () => {
				const task = populateTask();
				setup(
					<ListItemContent
						id={task.id}
						priority={task.priority}
						title={task.title}
						visible
						status={Status.Complete}
					/>
				);

				expect(screen.queryByTestId(ICON_REGEXP.completeAction)).not.toBeInTheDocument();
				expect(
					within(screen.getByTestId(TEST_ID_SELECTOR.hoverBar)).queryByTestId(
						ICON_REGEXP.completeAction
					)
				).not.toBeInTheDocument();
			});
			test(`When task status is open, complete action is visible in contextual menu`, async () => {
				const task = populateTask();
				const { user } = setup(
					<ListItemContent
						id={task.id}
						priority={task.priority}
						title={task.title}
						visible
						status={Status.Open}
					/>
				);

				await user.rightClick(screen.getByText(task.title));
				const dropdown = await screen.findByTestId(TEST_ID_SELECTOR.dropdown);
				expect(screen.getByText('Complete')).toBeVisible();
				expect(within(dropdown).getByTestId(ICON_REGEXP.completeAction)).toBeVisible();
			});
			test(`When task status is complete, complete action is missing in contextual menu`, async () => {
				const task = populateTask();
				const { user } = setup(
					<ListItemContent
						id={task.id}
						priority={task.priority}
						title={task.title}
						visible
						status={Status.Complete}
					/>
				);

				await user.rightClick(screen.getByText(task.title));
				const dropdown = await screen.findByTestId(TEST_ID_SELECTOR.dropdown);
				expect(within(dropdown).queryByTestId(ICON_REGEXP.completeAction)).not.toBeInTheDocument();
			});
		});

		describe('Uncomplete', () => {
			test(`When task status is complete, uncomplete action is visible on hover`, async () => {
				const task = populateTask();
				setup(
					<ListItemContent
						id={task.id}
						priority={task.priority}
						title={task.title}
						visible
						status={Status.Complete}
					/>
				);

				// rtl isVisible is not working on hover bar
				// Check that the action is inside the hover bar
				expect(screen.getByTestId(ICON_REGEXP.uncompleteAction)).toBeInTheDocument();
				expect(
					within(screen.getByTestId(TEST_ID_SELECTOR.hoverBar)).getByTestId(
						ICON_REGEXP.uncompleteAction
					)
				).toBeInTheDocument();
			});
			test(`When task status is open, uncomplete action is missing on hover`, async () => {
				const task = populateTask();
				setup(
					<ListItemContent
						id={task.id}
						priority={task.priority}
						title={task.title}
						visible
						status={Status.Open}
					/>
				);

				expect(screen.queryByTestId(ICON_REGEXP.uncompleteAction)).not.toBeInTheDocument();
				expect(
					within(screen.getByTestId(TEST_ID_SELECTOR.hoverBar)).queryByTestId(
						ICON_REGEXP.uncompleteAction
					)
				).not.toBeInTheDocument();
			});
			test(`When task status is complete, uncomplete action is visible in contextual menu`, async () => {
				const task = populateTask();
				const { user } = setup(
					<ListItemContent
						id={task.id}
						priority={task.priority}
						title={task.title}
						visible
						status={Status.Complete}
					/>
				);

				await user.rightClick(screen.getByText(task.title));
				const dropdown = await screen.findByTestId(TEST_ID_SELECTOR.dropdown);
				expect(screen.getByText('Uncomplete')).toBeVisible();
				expect(within(dropdown).getByTestId(ICON_REGEXP.uncompleteAction)).toBeVisible();
			});
			test(`When task status is open, uncomplete action is missing in contextual menu`, async () => {
				const task = populateTask();
				const { user } = setup(
					<ListItemContent
						id={task.id}
						priority={task.priority}
						title={task.title}
						visible
						status={Status.Open}
					/>
				);

				await user.rightClick(screen.getByText(task.title));
				const dropdown = await screen.findByTestId(TEST_ID_SELECTOR.dropdown);
				expect(
					within(dropdown).queryByTestId(ICON_REGEXP.uncompleteAction)
				).not.toBeInTheDocument();
			});
		});

		describe('Edit', () => {
			test.each([[Status.Open], [Status.Complete]])(
				'When task status is %s, edit action is visible on hover',
				async (status) => {
					const task = populateTask();
					setup(
						<ListItemContent
							id={task.id}
							priority={task.priority}
							title={task.title}
							visible
							status={status}
						/>
					);

					// rtl isVisible is not working on hover bar
					// Check that the action is inside the hover bar
					expect(screen.getByTestId(ICON_REGEXP.editAction)).toBeInTheDocument();
					expect(
						within(screen.getByTestId(TEST_ID_SELECTOR.hoverBar)).getByTestId(
							ICON_REGEXP.editAction
						)
					).toBeInTheDocument();
				}
			);

			test.each([[Status.Open], [Status.Complete]])(
				'When task status is %s, edit action is visible in contextual menu',
				async (status) => {
					const task = populateTask();
					const { user } = setup(
						<ListItemContent
							id={task.id}
							priority={task.priority}
							title={task.title}
							visible
							status={status}
						/>
					);

					await user.rightClick(screen.getByText(task.title));
					const dropdown = await screen.findByTestId(TEST_ID_SELECTOR.dropdown);
					expect(screen.getByText('Edit')).toBeVisible();
					expect(within(dropdown).getByTestId(ICON_REGEXP.editAction)).toBeVisible();
				}
			);
		});

		describe('Delete', () => {
			test.each([[Status.Open], [Status.Complete]])(
				'When task status is %s, delete action is visible on hover',
				async (status) => {
					const task = populateTask();
					setup(
						<ListItemContent
							id={task.id}
							priority={task.priority}
							title={task.title}
							visible
							status={status}
						/>
					);

					// rtl isVisible is not working on hover bar
					// Check that the action is inside the hover bar
					expect(screen.getByTestId(ICON_REGEXP.deleteAction)).toBeInTheDocument();
					expect(
						within(screen.getByTestId(TEST_ID_SELECTOR.hoverBar)).getByTestId(
							ICON_REGEXP.deleteAction
						)
					).toBeInTheDocument();
				}
			);

			test.each([[Status.Open], [Status.Complete]])(
				'When task status is %s, delete action is visible in contextual menu',
				async (status) => {
					const task = populateTask();
					const { user } = setup(
						<ListItemContent
							id={task.id}
							priority={task.priority}
							title={task.title}
							visible
							status={status}
						/>
					);

					await user.rightClick(screen.getByText(task.title));
					const dropdown = await screen.findByTestId(TEST_ID_SELECTOR.dropdown);
					expect(screen.getByText('Delete')).toBeVisible();
					expect(within(dropdown).getByTestId(ICON_REGEXP.deleteAction)).toBeVisible();
				}
			);
		});
	});
});
