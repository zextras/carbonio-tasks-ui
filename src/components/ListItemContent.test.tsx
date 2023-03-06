/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen } from '@testing-library/react';
import moment from 'moment-timezone';

import { ListItemContent } from './ListItemContent';
import { ICON_REGEXP } from '../contexts/tests';
import { Priority } from '../gql/types';
import { setup } from '../utils/testUtils';

describe('Task list item', () => {
	describe('Title', () => {
		test('The title is always shown', () => {
			setup(
				<ListItemContent
					id={'id1'}
					title={'Task title'}
					priority={Priority.Medium}
					timeZoneId={'UTC'}
					visible
				/>
			);
			const title = screen.getByText('Task title');
			expect(title).toBeInTheDocument();
			expect(title).toBeVisible();
		});
	});
	describe('Priority', () => {
		test('When priority is high then high priority icon is shown', async () => {
			setup(
				<ListItemContent
					id={'id1'}
					title={'Task title'}
					priority={Priority.High}
					timeZoneId={'UTC'}
					visible
				/>
			);
			const highPriorityIcon = await screen.findByTestId(ICON_REGEXP.highPriority);

			expect(highPriorityIcon).toBeInTheDocument();
			expect(highPriorityIcon).toBeVisible();
		});
		test('When priority is low then low priority icon is shown', async () => {
			setup(
				<ListItemContent
					id={'id1'}
					title={'Task title'}
					priority={Priority.Low}
					timeZoneId={'UTC'}
					visible
				/>
			);
			const lowPriorityIcon = await screen.findByTestId(ICON_REGEXP.lowPriority);

			expect(lowPriorityIcon).toBeInTheDocument();
			expect(lowPriorityIcon).toBeVisible();
		});
		test('When priority is medium then medium priority icon is shown', async () => {
			setup(
				<ListItemContent
					id={'id1'}
					title={'Task title'}
					priority={Priority.Medium}
					timeZoneId={'UTC'}
					visible
				/>
			);
			const mediumPriorityIcon = await screen.findByTestId(ICON_REGEXP.mediumPriority);

			expect(mediumPriorityIcon).toBeInTheDocument();
			expect(mediumPriorityIcon).toBeVisible();
		});
	});

	describe('Expired icon', () => {
		test('When the task reminder is expired then reminder expired icon is shown', async () => {
			const sevenDaysAgo = moment().tz('UTC').subtract(7, 'days');

			setup(
				<ListItemContent
					id={'id1'}
					title={'Task title'}
					priority={Priority.Medium}
					timeZoneId={'UTC'}
					visible
					reminderAt={sevenDaysAgo.valueOf()}
				/>
			);
			const reminderExpiredIcon = await screen.findByTestId(ICON_REGEXP.reminderExpired);

			expect(reminderExpiredIcon).toBeInTheDocument();
			expect(reminderExpiredIcon).toBeVisible();
		});
	});

	describe('Reminder info', () => {
		test('When there is not a reminder then the string "Do not remind me" is shown', async () => {
			setup(
				<ListItemContent
					id={'id1'}
					title={'Task title'}
					priority={Priority.Medium}
					timeZoneId={'UTC'}
					visible
				/>
			);
			const reminderText = await screen.findByText('Do not remind me');

			expect(reminderText).toBeInTheDocument();
			expect(reminderText).toBeVisible();
		});
		test('When there is a reminder then the string "Remind me on" is shown', async () => {
			const sevenDaysAgo = moment().tz('UTC').subtract(7, 'days');

			setup(
				<ListItemContent
					id={'id1'}
					title={'Task title'}
					priority={Priority.Medium}
					timeZoneId={'UTC'}
					visible
					reminderAt={sevenDaysAgo.valueOf()}
				/>
			);
			const reminderText = await screen.findByText('Remind me on');

			expect(reminderText).toBeInTheDocument();
			expect(reminderText).toBeVisible();
		});
		test('When there is a reminder not flagged as all-day then hours and minutes are shown', async () => {
			const pastDate = moment.tz('08 08 1988 09:15:00', 'DD MM YYYY hh:mm:ss', 'UTC');
			setup(
				<ListItemContent
					id={'id1'}
					title={'Task title'}
					priority={Priority.Medium}
					timeZoneId={'UTC'}
					visible
					reminderAt={pastDate.valueOf()}
				/>
			);
			const reminderDate = await screen.findByText('Aug 08, 1988 - 09:15');

			expect(reminderDate).toBeInTheDocument();
			expect(reminderDate).toBeVisible();
		});
		test('When there is a reminder flagged as all-day then hours and minutes are not shown', async () => {
			const pastDate = moment.tz('12 06 1995 09:15:00', 'DD MM YYYY hh:mm:ss', 'UTC');

			setup(
				<ListItemContent
					id={'id1'}
					title={'Task title'}
					priority={Priority.Medium}
					timeZoneId={'UTC'}
					visible
					reminderAt={pastDate.valueOf()}
					reminderAllDay
				/>
			);
			expect(screen.queryByText('Jun 12, 1995 - 09:15')).not.toBeInTheDocument();

			const reminderDateWithoutTime = screen.getByText('Jun 12, 1995');

			expect(reminderDateWithoutTime).toBeInTheDocument();
			expect(reminderDateWithoutTime).toBeVisible();
		});
	});

	describe('Expiration', () => {
		test('An all day reminder is considered expired the day after', async () => {
			const yesterdayAtNoon = moment.tz('UTC').hour(12).minute(0).subtract(1, 'days');

			setup(
				<ListItemContent
					id={'id1'}
					title={'Task title'}
					priority={Priority.Medium}
					timeZoneId={'UTC'}
					visible
					reminderAt={yesterdayAtNoon.valueOf()}
					reminderAllDay
				/>
			);
			const minusOutlineIcon = await screen.findByTestId(ICON_REGEXP.reminderExpired);

			expect(minusOutlineIcon).toBeInTheDocument();
			expect(minusOutlineIcon).toBeVisible();
		});

		test('An all day reminder is not considered expired the same day', async () => {
			const todayAtNoon = moment.tz('UTC').hour(12).minute(0);

			setup(
				<ListItemContent
					id={'id1'}
					title={'Task title'}
					priority={Priority.Medium}
					timeZoneId={'UTC'}
					visible
					reminderAt={todayAtNoon.valueOf()}
					reminderAllDay
				/>
			);
			expect(screen.queryByTestId(ICON_REGEXP.reminderExpired)).not.toBeInTheDocument();
		});

		test('A time specific reminder is considered expired the millisecond after', async () => {
			const oneSecondAgo = moment.tz('UTC').subtract(1, 'milliseconds');

			setup(
				<ListItemContent
					id={'id1'}
					title={'Task title'}
					priority={Priority.Medium}
					timeZoneId={'UTC'}
					visible
					reminderAt={oneSecondAgo.valueOf()}
				/>
			);
			const reminderExpiredIcon = await screen.findByTestId(ICON_REGEXP.reminderExpired);

			expect(reminderExpiredIcon).toBeInTheDocument();
			expect(reminderExpiredIcon).toBeVisible();
		});

		test('A time specific reminder is not considered expired the same millisecond', async () => {
			const now = moment.tz('UTC');

			setup(
				<ListItemContent
					id={'id1'}
					title={'Task title'}
					priority={Priority.Medium}
					timeZoneId={'UTC'}
					visible
					reminderAt={now.valueOf()}
				/>
			);
			expect(screen.queryByTestId(ICON_REGEXP.reminderExpired)).not.toBeInTheDocument();
		});
	});
});
