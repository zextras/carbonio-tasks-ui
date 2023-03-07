/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { screen } from '@testing-library/react';
import moment from 'moment-timezone';

import { Reminder } from './Reminder';
import { DATE_FORMAT, DATE_TIME_FORMAT, TIMEZONE_DEFAULT } from '../constants';
import { setup } from '../utils/testUtils';

describe('Reminder', () => {
	test('Show time when not set as all day', () => {
		const date = moment(faker.datatype.datetime()).tz(TIMEZONE_DEFAULT);
		setup(<Reminder reminderAt={date.valueOf()} reminderAllDay={false} />);
		expect(screen.getByText(date.format(DATE_TIME_FORMAT))).toBeVisible();
	});

	test('Show only date when set as all day', () => {
		const date = moment(faker.datatype.datetime()).tz(TIMEZONE_DEFAULT);
		setup(<Reminder reminderAt={date.valueOf()} reminderAllDay />);
		expect(screen.getByText(date.format(DATE_FORMAT))).toBeVisible();
		expect(screen.queryByText(date.format(DATE_TIME_FORMAT))).not.toBeInTheDocument();
	});

	test('When expired show date as error', () => {
		const date = moment(faker.date.past()).tz(TIMEZONE_DEFAULT);
		setup(<Reminder reminderAt={date.valueOf()} />);
		expect(screen.getByText(date.format(DATE_TIME_FORMAT))).toBeVisible();
		expect(screen.getByText(date.format(DATE_TIME_FORMAT))).toHaveStyle({
			'font-weight': 700,
			color: '#d74942'
		});
	});

	test('When not expired does not show date as error', () => {
		const date = moment(faker.date.soon()).tz(TIMEZONE_DEFAULT);
		setup(<Reminder reminderAt={date.valueOf()} />);
		expect(screen.getByText(date.format(DATE_TIME_FORMAT))).toBeVisible();
		expect(screen.getByText(date.format(DATE_TIME_FORMAT))).toHaveStyle({
			'font-weight': 400,
			color: '#333333'
		});
	});
});
