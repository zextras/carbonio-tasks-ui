/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('New task board', () => {
	test.todo('Title is mandatory, when is not set the create button is disabled');

	test.todo('Title, when there are only spaces the create button is disabled');

	test.todo(
		'Title, when the limit of 1024 characters is reached the create button is disabled and the error description appears'
	);

	test.todo('Priority, medium is the default one');

	test.todo('Description is optional, is not set the create button is not disabled');

	test.todo(
		'Description, when the limit of 4096 characters is reached the create button is disabled and the error description appears'
	);

	test.todo('Info banner, when the limit of 199 tasks is reached the info banner appears');

	test.todo(
		'Reminder, when all day checkbox is checked the time is missing in the input and in the picker'
	);

	test.todo(
		'Reminder, when all day checkbox is not checked the time is shown in the input and in the picker'
	);

	test.todo('Reminder is optional, is not set the create button is not disabled');

	test.todo(
		'Reminder is disabled by default, enabling the switch the related picker and checkbox appears'
	);

	test.todo('Reminder, when is enabled it is set with current date as default');
});
