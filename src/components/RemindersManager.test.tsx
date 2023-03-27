/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { act, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import { getNotificationManager, type NotificationConfig } from '@zextras/carbonio-shell-ui';
import {
	addMinutes,
	endOfToday,
	endOfTomorrow,
	endOfYesterday,
	startOfToday,
	startOfTomorrow,
	startOfYesterday,
	subMinutes
} from 'date-fns';

import { RemindersManager } from './RemindersManager';
import { TIMEZONE_DEFAULT } from '../constants';
import { ICON_REGEXP } from '../constants/tests';
import { Priority, Status, type Task, TaskFragmentDoc, type UpdateTaskInput } from '../gql/types';
import {
	mockFindTasks,
	mockUpdateTaskStatus,
	populateTask,
	populateTaskList
} from '../mocks/utils';
import { formatDateFromTimestamp } from '../utils';
import { setup } from '../utils/testUtils';

describe('Reminders manager', () => {
	async function waitForModalToOpen(): Promise<HTMLElement> {
		return screen.findByText(/tasks reminders/i);
	}

	async function editTask(updateTask: UpdateTaskInput): Promise<void> {
		global.apolloClient.writeFragment({
			fragment: TaskFragmentDoc,
			data: updateTask
		});
		await waitFor(
			() =>
				new Promise((resolve) => {
					setTimeout(resolve, 0);
				})
		);
	}

	test('On load show reminder which is set for today, before now, with a specific time', async () => {
		const todayBeforeNow = faker.date.between(startOfToday(), Date.now()).getTime();
		const task = populateTask({ reminderAt: todayBeforeNow, reminderAllDay: false });

		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		expect(
			screen.getByText(
				formatDateFromTimestamp(todayBeforeNow, {
					timezone: TIMEZONE_DEFAULT,
					includeTime: true
				})
			)
		).toBeVisible();
		expect(screen.getByText(task.title)).toBeVisible();
	});

	test('On load show reminder set for today, before now, all day', async () => {
		const todayBeforeNow = faker.date.between(startOfToday(), Date.now()).getTime();
		const task = populateTask({ reminderAt: todayBeforeNow, reminderAllDay: true });

		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		expect(
			screen.getByText(
				formatDateFromTimestamp(todayBeforeNow, {
					timezone: TIMEZONE_DEFAULT,
					includeTime: false
				})
			)
		).toBeVisible();
		expect(screen.getByText(task.title)).toBeVisible();
	});

	test('On load show reminder set for today, after now, all day', async () => {
		const todayAfterNow = faker.date.between(Date.now(), endOfToday()).getTime();
		const task = populateTask({ reminderAt: todayAfterNow, reminderAllDay: true });

		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		expect(
			screen.getByText(
				formatDateFromTimestamp(todayAfterNow, {
					timezone: TIMEZONE_DEFAULT,
					includeTime: false
				})
			)
		).toBeVisible();
		expect(screen.getByText(task.title)).toBeVisible();
	});

	test('Show reminder set for today, after now, with specific time, only when it expires', async () => {
		const now = Date.now();
		const todayAfterNow = faker.date.between(now, endOfToday()).getTime();
		const task = populateTask({ reminderAt: todayAfterNow, reminderAllDay: false });
		const msDiffFromNow = todayAfterNow - now;

		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		setup(<RemindersManager />, { mocks });
		act(() => {
			jest.advanceTimersByTime(msDiffFromNow - 1);
		});
		expect(screen.queryByText(/tasks reminders/i)).not.toBeInTheDocument();
		act(() => {
			jest.advanceTimersByTime(1);
		});
		await waitForModalToOpen();
		expect(
			screen.getByText(
				formatDateFromTimestamp(todayAfterNow, {
					timezone: TIMEZONE_DEFAULT,
					includeTime: true
				})
			)
		).toBeVisible();
		expect(screen.getByText(task.title)).toBeVisible();
	});

	test('Does not show reminder set for yesterday, with specific time', async () => {
		const yesterday = faker.date.between(startOfYesterday(), endOfYesterday()).getTime();
		const task = populateTask({ reminderAt: yesterday, reminderAllDay: false });

		const findTasksMock = mockFindTasks({ status: Status.Open }, [task]);
		const mocks = [findTasksMock];
		setup(<RemindersManager />, { mocks });
		await waitFor(() => expect(findTasksMock.result).toHaveBeenCalled());
		act(() => {
			jest.advanceTimersToNextTimer();
		});
		expect(screen.queryByText(/tasks reminders/i)).not.toBeInTheDocument();
		expect(
			screen.queryByText(
				formatDateFromTimestamp(yesterday, {
					timezone: TIMEZONE_DEFAULT,
					includeTime: true
				})
			)
		).not.toBeInTheDocument();
		expect(screen.queryByText(task.title)).not.toBeInTheDocument();
	});

	test('Does not show reminder set for yesterday, all day', async () => {
		const yesterday = faker.date.between(startOfYesterday(), endOfYesterday()).getTime();
		const task = populateTask({ reminderAt: yesterday, reminderAllDay: true });

		const findTasksMock = mockFindTasks({ status: Status.Open }, [task]);
		const mocks = [findTasksMock];
		setup(<RemindersManager />, { mocks });
		await waitFor(() => expect(findTasksMock.result).toHaveBeenCalled());
		act(() => {
			jest.advanceTimersToNextTimer();
		});
		expect(screen.queryByText(/tasks reminders/i)).not.toBeInTheDocument();
		expect(
			screen.queryByText(
				formatDateFromTimestamp(yesterday, {
					timezone: TIMEZONE_DEFAULT,
					includeTime: false
				})
			)
		).not.toBeInTheDocument();
		expect(screen.queryByText(task.title)).not.toBeInTheDocument();
	});

	test('Does not show reminder set for tomorrow, with specific time', async () => {
		const tomorrow = faker.date.between(startOfTomorrow(), endOfTomorrow()).getTime();
		const task = populateTask({ reminderAt: tomorrow, reminderAllDay: false });

		const findTasksMock = mockFindTasks({ status: Status.Open }, [task]);
		const mocks = [findTasksMock];
		setup(<RemindersManager />, { mocks });
		await waitFor(() => expect(findTasksMock.result).toHaveBeenCalled());
		act(() => {
			jest.advanceTimersToNextTimer();
		});
		expect(screen.queryByText(/tasks reminders/i)).not.toBeInTheDocument();
		expect(
			screen.queryByText(
				formatDateFromTimestamp(tomorrow, {
					timezone: TIMEZONE_DEFAULT,
					includeTime: true
				})
			)
		).not.toBeInTheDocument();
		expect(screen.queryByText(task.title)).not.toBeInTheDocument();
	});

	test('Does not show reminder set for tomorrow, all day', async () => {
		const tomorrow = faker.date.between(startOfTomorrow(), endOfTomorrow()).getTime();
		const task = populateTask({ reminderAt: tomorrow, reminderAllDay: true });

		const findTasksMock = mockFindTasks({ status: Status.Open }, [task]);
		const mocks = [findTasksMock];
		setup(<RemindersManager />, { mocks });
		await waitFor(() => expect(findTasksMock.result).toHaveBeenCalled());
		act(() => {
			jest.advanceTimersToNextTimer();
		});
		expect(screen.queryByText(/tasks reminders/i)).not.toBeInTheDocument();
		expect(
			screen.queryByText(
				formatDateFromTimestamp(tomorrow, {
					timezone: TIMEZONE_DEFAULT,
					includeTime: false
				})
			)
		).not.toBeInTheDocument();
		expect(screen.queryByText(task.title)).not.toBeInTheDocument();
	});

	test('Does not show tasks without a reminder', async () => {
		const task1 = populateTask({ reminderAt: null, reminderAllDay: false });
		const task2 = populateTask({ reminderAt: null, reminderAllDay: true });
		const findTasksMock = mockFindTasks({ status: Status.Open }, [task1, task2]);
		const mocks = [findTasksMock];
		setup(<RemindersManager />, { mocks });
		await waitFor(() => expect(findTasksMock.result).toHaveBeenCalled());
		act(() => {
			jest.advanceTimersToNextTimer();
		});
		expect(screen.queryByText(/tasks reminders/i)).not.toBeInTheDocument();
		expect(screen.queryByText(task1.title)).not.toBeInTheDocument();
		expect(screen.queryByText(task2.title)).not.toBeInTheDocument();
	});

	test('Show task with status open', async () => {
		const task = populateTask({
			reminderAt: Date.now(),
			reminderAllDay: true,
			status: Status.Open
		});
		const findTasksMock = mockFindTasks({ status: Status.Open }, [task]);
		const mocks = [findTasksMock];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		expect(screen.getByText(task.title)).toBeVisible();
	});

	test('Does not show task with status completed', async () => {
		const task = populateTask({
			reminderAt: Date.now(),
			reminderAllDay: true,
			status: Status.Complete
		});
		const findTasksMock = mockFindTasks({ status: Status.Open }, [task]);
		const mocks = [findTasksMock];
		setup(<RemindersManager />, { mocks });
		await waitFor(() => expect(findTasksMock.result).toHaveBeenCalled());
		act(() => {
			jest.advanceTimersToNextTimer();
		});
		expect(screen.queryByText(/tasks reminders/i)).not.toBeInTheDocument();
		expect(screen.queryByText(task.title)).not.toBeInTheDocument();
	});

	test('Does not open the modal when a reminder set as completed expires', async () => {
		const now = Date.now();
		const todayAfterNow = faker.date.between(now, endOfToday()).getTime();
		const task = populateTask({
			reminderAt: todayAfterNow,
			reminderAllDay: false,
			status: Status.Complete
		});

		const findTaskMock = mockFindTasks({ status: Status.Open }, [task]);
		const mocks = [findTaskMock];
		setup(<RemindersManager />, { mocks });
		await waitFor(() => expect(findTaskMock.result).toHaveBeenCalled());
		act(() => {
			jest.advanceTimersByTime(todayAfterNow - now);
		});
		expect(screen.queryByText(/tasks reminders/i)).not.toBeInTheDocument();
		expect(screen.queryByText(task.title)).not.toBeInTheDocument();
	});

	test('Dismiss action close the modal', async () => {
		const reminder = populateTask({ reminderAt: Date.now(), reminderAllDay: true });
		const mocks = [mockFindTasks({ status: Status.Open }, [reminder])];
		const { user } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		const dismissButton = screen.getByRole('button', { name: /dismiss/i });
		expect(dismissButton).toBeVisible();
		expect(dismissButton).toBeEnabled();
		await user.click(dismissButton);
		expect(screen.queryByText(/tasks reminders/i)).not.toBeInTheDocument();
		expect(dismissButton).not.toBeInTheDocument();
	});

	test('Close icon action close the modal', async () => {
		const reminder = populateTask({ reminderAt: Date.now(), reminderAllDay: true });
		const mocks = [mockFindTasks({ status: Status.Open }, [reminder])];
		const { getByRoleWithIcon, user } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		const closeButton = getByRoleWithIcon('button', { icon: ICON_REGEXP.closeModal });
		expect(closeButton).toBeVisible();
		expect(closeButton).toBeEnabled();
		await user.click(closeButton);
		expect(screen.queryByText(/tasks reminders/i)).not.toBeInTheDocument();
		expect(closeButton).not.toBeInTheDocument();
	});

	test('Close icon action has a tooltip', async () => {
		const reminder = populateTask({ reminderAt: Date.now(), reminderAllDay: true });
		const mocks = [mockFindTasks({ status: Status.Open }, [reminder])];
		const { getByRoleWithIcon, user } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		const closeButton = getByRoleWithIcon('button', { icon: ICON_REGEXP.closeModal });
		await user.hover(closeButton);
		await screen.findByText(/close/i);
	});

	test('On load show reminders ordered by datetime ascending, with all day reminders first, ordered by original position', async () => {
		// original order: allDay1, withTime1, allDay2, withTime2
		// chronological order: allDay2, allDay1, withTime2, withTime1
		// expected final order: allDay1, allDay2, withTime2, withTime1
		const now = Date.now();
		const allDay1 = populateTask({
			reminderAt: faker.date.between(now, endOfToday()).getTime(),
			reminderAllDay: true,
			title: 'Task item all day 1'
		});
		const allDay2 = populateTask({
			reminderAt: faker.date.between(startOfToday(), now).getTime(),
			reminderAllDay: true,
			title: 'Task item all day 2'
		});
		// with time must be before now to be visible on load, withTime1 is 1 minute before now, withTime2 is 5 minutes before now
		// make withTime1 and 2 have a difference of more than 1 minute between each other, otherwise they could end up in the same minute
		const oneMinuteAgo = subMinutes(now, 1).getTime();
		const fiveMinutesAgo = subMinutes(now, 5).getTime();
		const withTime1 = populateTask({
			reminderAt: oneMinuteAgo,
			reminderAllDay: false,
			title: 'Task item with time 1'
		});
		const withTime2 = populateTask({
			reminderAt: fiveMinutesAgo,
			reminderAllDay: false,
			title: 'Task item with time 2'
		});

		const mocks = [
			mockFindTasks({ status: Status.Open }, [allDay1, withTime1, allDay2, withTime2])
		];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		const allDayDate = formatDateFromTimestamp(now, {
			timezone: TIMEZONE_DEFAULT,
			includeTime: false
		});
		const aMinuteAgoDate = formatDateFromTimestamp(oneMinuteAgo, {
			timezone: TIMEZONE_DEFAULT,
			includeTime: true
		});
		const fiveMinutesAgoDate = formatDateFromTimestamp(fiveMinutesAgo, {
			timezone: TIMEZONE_DEFAULT,
			includeTime: true
		});
		const visibleDates = screen.getAllByText(
			formatDateFromTimestamp(now, {
				timezone: TIMEZONE_DEFAULT,
				includeTime: false
			}),
			{ exact: false }
		);
		expect(visibleDates).toHaveLength(3);
		expect(visibleDates[0]).toHaveTextContent(allDayDate);
		expect(visibleDates[1]).toHaveTextContent(fiveMinutesAgoDate);
		expect(visibleDates[2]).toHaveTextContent(aMinuteAgoDate);
		const taskTitles = screen.getAllByText(/task item/i);
		expect(taskTitles).toHaveLength(4);
		expect(taskTitles[0]).toHaveTextContent(allDay1.title);
		expect(taskTitles[1]).toHaveTextContent(allDay2.title);
		expect(taskTitles[2]).toHaveTextContent(withTime2.title);
		expect(taskTitles[3]).toHaveTextContent(withTime1.title);
	});

	test('When a reminder expires, show the reminder at first position inside the modal', async () => {
		const now = Date.now();
		const allDayReminder = populateTask({
			reminderAt: now,
			reminderAllDay: true,
			title: 'Task item all day'
		});
		const withTimeExpired = populateTask({
			reminderAt: subMinutes(now, 1).getTime(),
			reminderAllDay: false,
			title: 'Task item with time expired'
		});
		const fiveMinutesFromNow = addMinutes(now, 5).getTime();
		const expiringReminder = populateTask({
			reminderAt: fiveMinutesFromNow,
			reminderAllDay: false,
			title: 'Task item expiring'
		});
		const mocks = [
			mockFindTasks({ status: Status.Open }, [allDayReminder, withTimeExpired, expiringReminder])
		];
		const { user } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		await user.click(screen.getByRole('button', { name: /dismiss/i }));
		act(() => {
			jest.advanceTimersByTime(fiveMinutesFromNow - now);
		});
		await waitForModalToOpen();
		const visibleDates = screen.getAllByText(
			formatDateFromTimestamp(now, {
				timezone: TIMEZONE_DEFAULT,
				includeTime: false
			}),
			{ exact: false }
		);
		expect(visibleDates[0]).toHaveTextContent(
			formatDateFromTimestamp(fiveMinutesFromNow, {
				timezone: TIMEZONE_DEFAULT,
				includeTime: true
			})
		);
		const taskTitles = screen.getAllByText(/task item/i);
		expect(taskTitles[0]).toHaveTextContent(expiringReminder.title);
	});

	test('When multiple reminders expire together, show the reminders at first positions inside the modal', async () => {
		const now = Date.now();
		const allDayReminder = populateTask({
			reminderAt: now,
			reminderAllDay: true,
			title: 'Task item all day'
		});
		const withTimeExpired = populateTask({
			reminderAt: subMinutes(now, 1).getTime(),
			reminderAllDay: false,
			title: 'Task item with time expired'
		});
		const fiveMinutesFromNow = addMinutes(now, 5).getTime();
		const expiringReminder1 = populateTask({
			reminderAt: fiveMinutesFromNow,
			reminderAllDay: false,
			title: 'Task item expiring 1'
		});
		const expiringReminder2 = populateTask({
			reminderAt: fiveMinutesFromNow,
			reminderAllDay: false,
			title: 'Task item expiring 2'
		});
		const mocks = [
			mockFindTasks({ status: Status.Open }, [
				allDayReminder,
				withTimeExpired,
				expiringReminder1,
				expiringReminder2
			])
		];
		const { user } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		await user.click(screen.getByRole('button', { name: /dismiss/i }));
		act(() => {
			jest.advanceTimersByTime(fiveMinutesFromNow - now);
		});
		await waitForModalToOpen();
		const visibleDates = screen.getAllByText(
			formatDateFromTimestamp(now, {
				timezone: TIMEZONE_DEFAULT,
				includeTime: false
			}),
			{ exact: false }
		);
		const expiringRemindersDate = formatDateFromTimestamp(fiveMinutesFromNow, {
			timezone: TIMEZONE_DEFAULT,
			includeTime: true
		});
		expect(visibleDates[0]).toHaveTextContent(expiringRemindersDate);
		// the date is shown only 1 time
		expect(screen.getByText(expiringRemindersDate)).toBeVisible();
		const taskTitles = screen.getAllByText(/task item/i);
		expect(taskTitles[0]).toHaveTextContent(expiringReminder1.title);
		expect(taskTitles[1]).toHaveTextContent(expiringReminder2.title);
	});

	test('When a reminder expires with the modal already open, show the reminder at last position inside the modal', async () => {
		const now = Date.now();
		const allDayReminder = populateTask({
			reminderAt: now,
			reminderAllDay: true,
			title: 'Task item all day'
		});
		const withTimeExpired = populateTask({
			reminderAt: subMinutes(now, 1).getTime(),
			reminderAllDay: false,
			title: 'Task item with time expired'
		});
		const fiveMinutesFromNow = addMinutes(now, 5).getTime();
		const expiringReminder = populateTask({
			reminderAt: fiveMinutesFromNow,
			reminderAllDay: false,
			title: 'Task item expiring'
		});
		const mocks = [
			mockFindTasks({ status: Status.Open }, [allDayReminder, withTimeExpired, expiringReminder])
		];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		act(() => {
			jest.advanceTimersByTime(fiveMinutesFromNow - now);
		});
		const visibleDates = screen.getAllByText(
			formatDateFromTimestamp(now, {
				timezone: TIMEZONE_DEFAULT,
				includeTime: false
			}),
			{ exact: false }
		);
		expect(visibleDates[2]).toHaveTextContent(
			formatDateFromTimestamp(fiveMinutesFromNow, {
				timezone: TIMEZONE_DEFAULT,
				includeTime: true
			})
		);
		const taskTitles = screen.getAllByText(/task item/i);
		expect(taskTitles[2]).toHaveTextContent(expiringReminder.title);
	});

	test('When multiple reminders expire together with the modal already open, show the reminders at last positions inside the modal', async () => {
		const now = Date.now();
		const allDayReminder = populateTask({
			reminderAt: now,
			reminderAllDay: true,
			title: 'Task item all day'
		});
		const withTimeExpired = populateTask({
			reminderAt: subMinutes(now, 1).getTime(),
			reminderAllDay: false,
			title: 'Task item with time expired'
		});
		const fiveMinutesFromNow = addMinutes(now, 5).getTime();
		const expiringReminder1 = populateTask({
			reminderAt: fiveMinutesFromNow,
			reminderAllDay: false,
			title: 'Task item expiring 1'
		});
		const expiringReminder2 = populateTask({
			reminderAt: fiveMinutesFromNow,
			reminderAllDay: false,
			title: 'Task item expiring 2'
		});
		const mocks = [
			mockFindTasks({ status: Status.Open }, [
				allDayReminder,
				withTimeExpired,
				expiringReminder1,
				expiringReminder2
			])
		];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		act(() => {
			jest.advanceTimersByTime(fiveMinutesFromNow - now);
		});
		await waitForModalToOpen();
		const visibleDates = screen.getAllByText(
			formatDateFromTimestamp(now, {
				timezone: TIMEZONE_DEFAULT,
				includeTime: false
			}),
			{ exact: false }
		);
		const expiringRemindersDate = formatDateFromTimestamp(fiveMinutesFromNow, {
			timezone: TIMEZONE_DEFAULT,
			includeTime: true
		});
		expect(visibleDates[2]).toHaveTextContent(expiringRemindersDate);
		// the date is shown only 1 time
		expect(screen.getByText(expiringRemindersDate)).toBeVisible();
		const taskTitles = screen.getAllByText(/task item/i);
		expect(taskTitles[2]).toHaveTextContent(expiringReminder1.title);
		expect(taskTitles[3]).toHaveTextContent(expiringReminder2.title);
	});

	test('When the modal is opened by a reminder expiration, and a new reminder expires with the modal still open, the new reminder is placed at the end', async () => {
		const now = Date.now();
		const allDayReminder = populateTask({
			reminderAt: now,
			reminderAllDay: true,
			title: 'Task item all day'
		});
		const withTimeExpired = populateTask({
			reminderAt: subMinutes(now, 1).getTime(),
			reminderAllDay: false,
			title: 'Task item with time expired'
		});
		const fiveMinutesFromNow = addMinutes(now, 5).getTime();
		const expiringReminder1 = populateTask({
			reminderAt: fiveMinutesFromNow,
			reminderAllDay: false,
			title: 'Task item expiring 1'
		});
		const tenMinutesFromNow = addMinutes(now, 10).getTime();
		const expiringReminder2 = populateTask({
			reminderAt: tenMinutesFromNow,
			reminderAllDay: false,
			title: 'Task item expiring 2'
		});
		const mocks = [
			mockFindTasks({ status: Status.Open }, [
				allDayReminder,
				withTimeExpired,
				expiringReminder1,
				expiringReminder2
			])
		];
		const { user } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		await user.click(screen.getByRole('button', { name: /dismiss/i }));
		act(() => {
			jest.advanceTimersByTime(fiveMinutesFromNow - now);
		});
		await waitForModalToOpen();
		expect(screen.getByText(expiringReminder1.title)).toBeVisible();
		expect(screen.queryByText(expiringReminder2.title)).not.toBeInTheDocument();
		act(() => {
			jest.advanceTimersByTime(tenMinutesFromNow - fiveMinutesFromNow);
		});
		const visibleDates = screen.getAllByText(
			formatDateFromTimestamp(now, {
				timezone: TIMEZONE_DEFAULT,
				includeTime: false
			}),
			{ exact: false }
		);
		const fiveMinutesFromNowDate = formatDateFromTimestamp(fiveMinutesFromNow, {
			timezone: TIMEZONE_DEFAULT,
			includeTime: true
		});
		const tenMinutesFromNowDate = formatDateFromTimestamp(tenMinutesFromNow, {
			timezone: TIMEZONE_DEFAULT,
			includeTime: true
		});
		expect(visibleDates[0]).toHaveTextContent(fiveMinutesFromNowDate);
		expect(visibleDates[3]).toHaveTextContent(tenMinutesFromNowDate);
		const taskTitles = screen.getAllByText(/task item/i);
		expect(taskTitles[0]).toHaveTextContent(expiringReminder1.title);
		expect(taskTitles[3]).toHaveTextContent(expiringReminder2.title);
	});

	test('Priority is shown for each task', async () => {
		// 9 tasks, 3 with low, 3 medium, 3 high
		const tasks = populateTaskList(9);
		const priorities = [Priority.Low, Priority.Medium, Priority.High];
		tasks.forEach((task, index) => {
			// eslint-disable-next-line no-param-reassign
			task.priority = priorities[index % 3];
			// eslint-disable-next-line no-param-reassign
			task.reminderAt = Date.now();
		});
		const mocks = [mockFindTasks({ status: Status.Open }, tasks)];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		expect(screen.getAllByTestId(ICON_REGEXP.lowPriority)).toHaveLength(3);
		expect(screen.getAllByTestId(ICON_REGEXP.mediumPriority)).toHaveLength(3);
		expect(screen.getAllByTestId(ICON_REGEXP.highPriority)).toHaveLength(3);
	});

	test('Complete action is visible for a task not completed', async () => {
		const task = populateTask({ reminderAt: Date.now() });
		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		const { getByRoleWithIcon, queryByRoleWithIcon } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		expect(getByRoleWithIcon('button', { icon: ICON_REGEXP.reminderCompleteAction })).toBeVisible();
		expect(getByRoleWithIcon('button', { icon: ICON_REGEXP.reminderCompleteAction })).toBeEnabled();
		expect(
			queryByRoleWithIcon('button', { icon: ICON_REGEXP.reminderUndoAction })
		).not.toBeInTheDocument();
	});

	test.skip('Complete action is hidden for a task completed', async () => {
		const task = populateTask({ reminderAt: Date.now() });
		const mocks = [
			mockFindTasks({ status: Status.Open }, [task]),
			mockUpdateTaskStatus({ id: task.id, status: Status.Complete })
		];
		const { getByRoleWithIcon, queryByRoleWithIcon, user } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		const completeAction = getByRoleWithIcon('button', {
			icon: ICON_REGEXP.reminderCompleteAction
		});
		await user.click(completeAction);
		await waitForElementToBeRemoved(completeAction);
		expect(
			queryByRoleWithIcon('button', { icon: ICON_REGEXP.reminderCompleteAction })
		).not.toBeInTheDocument();
	});

	test.skip('Undo action is visible for a task completed', async () => {
		const task = populateTask({ reminderAt: Date.now(), priority: Priority.Medium });
		const mocks = [
			mockFindTasks({ status: Status.Open }, [task]),
			mockUpdateTaskStatus({ id: task.id, status: Status.Complete })
		];
		const { getByRoleWithIcon, user } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		const completeAction = getByRoleWithIcon('button', {
			icon: ICON_REGEXP.reminderCompleteAction
		});
		await user.click(completeAction);
		await waitForElementToBeRemoved(completeAction);
		expect(getByRoleWithIcon('button', { icon: ICON_REGEXP.reminderUndoAction })).toBeVisible();
		expect(getByRoleWithIcon('button', { icon: ICON_REGEXP.reminderUndoAction })).toBeEnabled();
	});

	test('Undo action is hidden for a task not completed', async () => {
		const task = populateTask({ reminderAt: Date.now(), priority: Priority.Medium });
		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		const { queryByRoleWithIcon } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		expect(
			queryByRoleWithIcon('button', { icon: ICON_REGEXP.reminderUndoAction })
		).not.toBeInTheDocument();
	});

	test.skip('Priority is hidden for a task completed', async () => {
		const task = populateTask({ reminderAt: Date.now(), priority: Priority.Medium });
		const mocks = [
			mockFindTasks({ status: Status.Open }, [task]),
			mockUpdateTaskStatus({ id: task.id, status: Status.Complete })
		];
		const { getByRoleWithIcon, user } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		const completeAction = getByRoleWithIcon('button', {
			icon: ICON_REGEXP.reminderCompleteAction
		});
		await user.click(completeAction);
		await waitForElementToBeRemoved(completeAction);
		expect(screen.queryByTestId(ICON_REGEXP.mediumPriority)).not.toBeInTheDocument();
	});

	test.skip('Complete indicator is visible for a task completed', async () => {
		const task = populateTask({ reminderAt: Date.now() });
		const mocks = [
			mockFindTasks({ status: Status.Open }, [task]),
			mockUpdateTaskStatus({ id: task.id, status: Status.Complete })
		];
		const { getByRoleWithIcon, user } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		const completeAction = getByRoleWithIcon('button', {
			icon: ICON_REGEXP.reminderCompleteAction
		});
		await user.click(completeAction);
		await waitForElementToBeRemoved(completeAction);
		expect(screen.getByTestId(ICON_REGEXP.reminderComplete)).toBeVisible();
	});

	test('Complete indicator is hidden for a task not completed', async () => {
		const task = populateTask({ reminderAt: Date.now() });
		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		const { getByRoleWithIcon } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		const completeAction = getByRoleWithIcon('button', {
			icon: ICON_REGEXP.reminderCompleteAction
		});
		// there is only one icon, and it is inside the complete action, so the indicator is not present
		const completeIcon = screen.getByTestId(ICON_REGEXP.reminderComplete);
		expect(completeIcon).toBeVisible();
		expect(within(completeAction).getByTestId(ICON_REGEXP.reminderComplete)).toBe(completeIcon);
	});

	test.skip('Complete all action updates all task to status complete and is replaced by undo all action', async () => {
		const allDay = populateTask({ reminderAt: Date.now(), reminderAllDay: true });
		const withTime = populateTask({
			reminderAt: subMinutes(Date.now(), 5).getTime(),
			reminderAllDay: false
		});
		const mocks = [
			mockFindTasks({ status: Status.Open }, [allDay, withTime]),
			mockUpdateTaskStatus({ id: allDay.id, status: Status.Complete }),
			mockUpdateTaskStatus({ id: withTime.id, status: Status.Complete })
		];
		const { getAllByRoleWithIcon, user } = setup(<RemindersManager />, {
			mocks
		});
		await waitForModalToOpen();
		const completeAllButton = screen.getByRole('button', { name: /complete all/i });
		await user.click(completeAllButton);
		await waitForElementToBeRemoved(completeAllButton);
		expect(screen.getAllByTestId(ICON_REGEXP.reminderComplete)).toHaveLength(2);
		expect(screen.getAllByText(/completed/i)).toHaveLength(2);
		expect(getAllByRoleWithIcon('button', { icon: ICON_REGEXP.reminderUndoAction })).toHaveLength(
			2
		);
		expect(screen.getByRole('button', { name: /undo all/i })).toBeVisible();
	});

	test.skip('Undo all action updates all task to status open and is replaced by complete all action', async () => {
		const allDay = populateTask({ reminderAt: Date.now(), reminderAllDay: true });
		const withTime = populateTask({
			reminderAt: subMinutes(Date.now(), 5).getTime(),
			reminderAllDay: false
		});
		const mocks = [
			mockFindTasks({ status: Status.Open }, [allDay, withTime]),
			mockUpdateTaskStatus({ id: allDay.id, status: Status.Complete }),
			mockUpdateTaskStatus({ id: withTime.id, status: Status.Complete }),
			mockUpdateTaskStatus({ id: allDay.id, status: Status.Open }),
			mockUpdateTaskStatus({ id: withTime.id, status: Status.Open })
		];
		const { getAllByRoleWithIcon, user } = setup(<RemindersManager />, {
			mocks
		});
		await waitForModalToOpen();
		const completeAllButton = screen.getByRole('button', { name: /complete all/i });
		await user.click(completeAllButton);
		const undoAllButton = await screen.findByRole('button', { name: /undo all/i });
		await user.click(undoAllButton);
		await waitForElementToBeRemoved(undoAllButton);
		expect(screen.queryByTestId(ICON_REGEXP.reminderComplete)).not.toBeInTheDocument();
		expect(screen.queryByText(/completed/i)).not.toBeInTheDocument();
		// filter out complete all button with name field set to empty
		expect(
			getAllByRoleWithIcon('button', { icon: ICON_REGEXP.reminderCompleteAction, name: '' })
		).toHaveLength(3);
		expect(screen.getByRole('button', { name: /complete all/i })).toBeVisible();
	});

	test.skip('Undo all action is replaced by complete all action if at least one task becomes not completed', async () => {
		const allDay = populateTask({ reminderAt: Date.now(), reminderAllDay: true });
		const withTime = populateTask({
			reminderAt: subMinutes(Date.now(), 5).getTime(),
			reminderAllDay: false
		});
		const mocks = [
			mockFindTasks({ status: Status.Open }, [allDay, withTime]),
			mockUpdateTaskStatus({ id: allDay.id, status: Status.Complete }),
			mockUpdateTaskStatus({ id: withTime.id, status: Status.Complete }),
			mockUpdateTaskStatus({ id: allDay.id, status: Status.Open })
		];
		const { getAllByRoleWithIcon, user } = setup(<RemindersManager />, {
			mocks
		});
		await waitForModalToOpen();
		const completeAllButton = screen.getByRole('button', { name: /complete all/i });
		await user.click(completeAllButton);
		const undoAllButton = await screen.findByRole('button', { name: /undo all/i });
		// click on undo action of a single task
		await user.click(
			getAllByRoleWithIcon('button', { icon: ICON_REGEXP.reminderUndoAction, name: '' })[0]
		);
		await screen.findByRole('button', { name: /complete all/i });
		expect(undoAllButton).not.toBeInTheDocument();
	});

	test.skip('Undo all action is replaced by complete all action if at least one new reminder is added to the modal', async () => {
		const now = Date.now();
		const allDay = populateTask({ reminderAt: now, reminderAllDay: true });
		const withTime = populateTask({
			reminderAt: subMinutes(Date.now(), 5).getTime(),
			reminderAllDay: false
		});
		const fiveMinutesFromNow = addMinutes(now, 5).getTime();
		const expiring = populateTask({ reminderAt: fiveMinutesFromNow, reminderAllDay: false });
		const mocks = [
			mockFindTasks({ status: Status.Open }, [allDay, withTime, expiring]),
			mockUpdateTaskStatus({ id: allDay.id, status: Status.Complete }),
			mockUpdateTaskStatus({ id: withTime.id, status: Status.Complete })
		];
		const { user } = setup(<RemindersManager />, {
			mocks
		});
		await waitForModalToOpen();
		const completeAllButton = screen.getByRole('button', { name: /complete all/i });
		await user.click(completeAllButton);
		const undoAllButton = await screen.findByRole('button', { name: /undo all/i });
		act(() => {
			jest.advanceTimersByTime(fiveMinutesFromNow - now);
		});
		await screen.findByText(expiring.title);
		expect(undoAllButton).not.toBeInTheDocument();
		expect(completeAllButton).toBeVisible();
	});

	test('Complete all action is not visible if there is only one task in the list', async () => {
		const task = populateTask({ reminderAt: Date.now() });
		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		expect(screen.queryByRole('button', { name: /complete all/i })).not.toBeInTheDocument();
	});

	test.skip('Undo all action is not visible if there is only one task in the list', async () => {
		const task = populateTask({ reminderAt: Date.now() });
		const mocks = [
			mockFindTasks({ status: Status.Open }, [task]),
			mockUpdateTaskStatus({ id: task.id, status: Status.Complete })
		];
		const { getByRoleWithIcon, user } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		const completeAction = getByRoleWithIcon('button', {
			icon: ICON_REGEXP.reminderCompleteAction
		});
		await user.click(completeAction);
		await waitForElementToBeRemoved(completeAction);
		expect(screen.queryByRole('button', { name: /undo all/i })).not.toBeInTheDocument();
	});

	describe('Notification', () => {
		test('A sound is played when the modal is shown on load', async () => {
			const task = populateTask({
				reminderAt: faker.date.between(startOfToday(), Date.now()).getTime(),
				reminderAllDay: false
			});
			const mockNotify = jest.spyOn(getNotificationManager(), 'notify');
			const mocks = [mockFindTasks({ status: Status.Open }, [task])];
			setup(<RemindersManager />, { mocks });
			await waitForModalToOpen();
			expect(mockNotify).toHaveBeenCalled();
			expect(mockNotify).toHaveBeenCalledTimes(1);
			const notifyConfig: NotificationConfig = {
				showPopup: false,
				playSound: true
			};
			expect(mockNotify).toHaveBeenCalledWith(notifyConfig);
		});

		test('A sound is played when the modal is shown because a reminder expires', async () => {
			const task = populateTask({
				reminderAt: addMinutes(Date.now(), 1).getTime(),
				reminderAllDay: false
			});
			const mockNotify = jest.spyOn(getNotificationManager(), 'notify');
			const mocks = [mockFindTasks({ status: Status.Open }, [task])];
			setup(<RemindersManager />, { mocks });
			act(() => {
				// advance timers by 1 minute to make reminder expires
				jest.advanceTimersByTime(60000);
			});
			await waitForModalToOpen();
			expect(mockNotify).toHaveBeenCalled();
			expect(mockNotify).toHaveBeenCalledTimes(1);
			const notifyConfig: NotificationConfig = {
				showPopup: false,
				playSound: true
			};
			expect(mockNotify).toHaveBeenCalledWith(notifyConfig);
		});

		test('A sound is played when a new reminder is added to the already opened modal', async () => {
			const now = Date.now();
			const oneMinuteFromNow = addMinutes(now, 1).getTime();
			const fiveMinutesFromNow = addMinutes(now, 5).getTime();
			const task1 = populateTask({ reminderAt: oneMinuteFromNow, reminderAllDay: false });
			const task2 = populateTask({ reminderAt: fiveMinutesFromNow, reminderAllDay: false });
			const mockNotify = jest.spyOn(getNotificationManager(), 'notify');
			const mocks = [mockFindTasks({ status: Status.Open }, [task1, task2])];
			setup(<RemindersManager />, { mocks });
			act(() => {
				jest.advanceTimersByTime(oneMinuteFromNow - now);
			});
			await waitForModalToOpen();
			expect(mockNotify).toHaveBeenCalled();
			expect(mockNotify).toHaveBeenCalledTimes(1);
			// clear mock calls
			mockNotify.mockClear();
			act(() => {
				jest.advanceTimersByTime(fiveMinutesFromNow - now);
			});
			expect(mockNotify).toHaveBeenCalled();
			expect(mockNotify).toHaveBeenCalledTimes(1);
			const notifyConfig: NotificationConfig = {
				showPopup: false,
				playSound: true
			};
			expect(mockNotify).toHaveBeenCalledWith(notifyConfig);
		});
	});

	test('Does not open the modal when a reminders expires if it is set as completed', async () => {
		const now = Date.now();
		const fiveMinutesFromNow = addMinutes(now, 5).getTime();
		const tenMinutesFromNow = addMinutes(now, 10).getTime();
		const task = populateTask({
			reminderAt: fiveMinutesFromNow,
			reminderAllDay: false
		});
		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		const { user } = setup(<RemindersManager />, { mocks });
		act(() => {
			jest.advanceTimersByTime(fiveMinutesFromNow - now);
		});
		await waitForModalToOpen();
		await user.click(screen.getByRole('button', { name: /dismiss/i }));
		await editTask({ ...task, reminderAt: tenMinutesFromNow, status: Status.Complete });
		act(() => {
			jest.advanceTimersByTime(tenMinutesFromNow - fiveMinutesFromNow);
		});
		expect(screen.queryByText(/tasks reminders/i)).not.toBeInTheDocument();
	});

	test('When the reminder of a task is edited to a future time, the reminder modal is shown at the new datetime', async () => {
		const now = Date.now();
		const fiveMinutesFromNow = addMinutes(now, 5).getTime();
		const tenMinutesFromNow = addMinutes(now, 10).getTime();
		const task = populateTask({ reminderAt: fiveMinutesFromNow, reminderAllDay: false });
		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		const { user } = setup(<RemindersManager />, { mocks });
		act(() => {
			jest.advanceTimersByTime(fiveMinutesFromNow - now);
		});
		await waitForModalToOpen();
		await user.click(screen.getByRole('button', { name: /dismiss/i }));
		await editTask({ ...task, reminderAt: tenMinutesFromNow });
		act(() => {
			jest.advanceTimersByTime(tenMinutesFromNow - fiveMinutesFromNow);
		});
		await waitForModalToOpen();
		expect(
			screen.getByText(
				formatDateFromTimestamp(tenMinutesFromNow, {
					timezone: TIMEZONE_DEFAULT,
					includeTime: true
				})
			)
		).toBeVisible();
		expect(
			screen.queryByText(
				formatDateFromTimestamp(fiveMinutesFromNow, {
					timezone: TIMEZONE_DEFAULT,
					includeTime: true
				})
			)
		).not.toBeInTheDocument();
	});

	test('When the reminder of a task is edited to a past time, the reminder modal is not shown', async () => {
		const now = Date.now();
		const fiveMinutesFromNow = addMinutes(now, 5).getTime();
		const tenMinutesBeforeNow = subMinutes(now, 10).getTime();
		const task = populateTask({ reminderAt: fiveMinutesFromNow, reminderAllDay: false });
		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		setup(<RemindersManager />, { mocks });
		await editTask({ ...task, reminderAt: tenMinutesBeforeNow });
		act(() => {
			jest.runOnlyPendingTimers();
		});
		expect(screen.queryByText(/tasks reminders/i)).not.toBeInTheDocument();
	});

	test('When the reminder of a task is edited and disabled, the reminder modal is not shown', async () => {
		const task = populateTask();
		task.reminderAt = addMinutes(Date.now(), 5).getTime();
		task.reminderAllDay = false;
		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		setup(<RemindersManager />, { mocks });
		await editTask({ ...task, reminderAt: null });
		act(() => {
			jest.runOnlyPendingTimers();
		});
		expect(screen.queryByText(/tasks reminders/i)).not.toBeInTheDocument();
	});

	test('If the task is updated with a new reminder date, show the reminder in the new ordered position inside the modal', async () => {
		const now = Date.now();
		const fiveMinutesFromNow = addMinutes(now, 5).getTime();
		const tenMinutesFromNow = addMinutes(now, 10).getTime();
		const fromAllDayToTime = populateTask({
			reminderAt: fiveMinutesFromNow,
			reminderAllDay: true,
			title: 'Task item from all day to time'
		});
		const fromTimeToAllDay = populateTask({
			reminderAt: fiveMinutesFromNow,
			reminderAllDay: false,
			title: 'Task item from time to all day'
		});
		const fromTimeToTime = populateTask({
			reminderAt: fiveMinutesFromNow,
			reminderAllDay: false,
			title: 'Task item from time to time'
		});
		const anotherTaskToTriggerModal = populateTask({
			reminderAt: addMinutes(fiveMinutesFromNow, 2).getTime(),
			reminderAllDay: false,
			title: 'Different title not considered in getAllByText selector'
		});
		const mocks = [
			mockFindTasks({ status: Status.Open }, [
				fromAllDayToTime,
				fromTimeToAllDay,
				fromTimeToTime,
				anotherTaskToTriggerModal
			])
		];
		const { user } = setup(<RemindersManager />, { mocks });
		// modal opens on load because of the all day reminder
		await waitForModalToOpen();
		await user.click(screen.getByRole('button', { name: /dismiss/i }));
		act(() => {
			// advance timers of 5 minutes to make group of reminders to check expires
			jest.advanceTimersByTime(60000 * 5);
		});
		// modal opens because of the fiveMinutesFromNow with-time reminders
		await waitForModalToOpen();
		// close so that on next opening the tasks are shown in their "already seen" position
		await user.click(screen.getByRole('button', { name: /dismiss/i }));
		act(() => {
			// advance timers of 2 minutes to make the additional reminder expire
			jest.advanceTimersByTime(60000 * 2);
		});
		// modal opens because the additional reminder is expired
		await waitForModalToOpen();
		// now the reminders to check are in the "already seen" position
		let taskTitles = screen.getAllByText(/task item/i);
		expect(taskTitles).toHaveLength(3);
		expect(taskTitles[0]).toHaveTextContent(fromAllDayToTime.title);
		expect(taskTitles[1]).toHaveTextContent(fromTimeToAllDay.title);
		expect(taskTitles[2]).toHaveTextContent(fromTimeToTime.title);
		// close the modal and edit the reminders to check
		await user.click(screen.getByRole('button', { name: /dismiss/i }));
		await editTask({ ...fromAllDayToTime, reminderAllDay: false });
		await editTask({ ...fromTimeToAllDay, reminderAt: tenMinutesFromNow, reminderAllDay: true });
		await editTask({ ...fromTimeToTime, reminderAt: tenMinutesFromNow });
		await editTask({
			...anotherTaskToTriggerModal,
			reminderAt: addMinutes(tenMinutesFromNow, 2).getTime()
		});
		act(() => {
			// advance timers of another 3 minutes to make group of reminders to check expires
			jest.advanceTimersByTime(60000 * 3);
		});
		await waitForModalToOpen();
		// close so that on next opening the tasks are shown in their "already seen" position
		await user.click(screen.getByRole('button', { name: /dismiss/i }));
		act(() => {
			// advance timers of 2 minutes to make the additional reminder expire
			jest.advanceTimersByTime(60000 * 2);
		});
		// modal opens because the additional reminder is expired
		await waitForModalToOpen();
		// now the reminders to check are again in the "already seen" position
		taskTitles = screen.getAllByText(/task item/i);
		expect(taskTitles).toHaveLength(3);
		// fromTimeToAllDay is the first to appear since it is all day now
		expect(taskTitles[0]).toHaveTextContent(fromTimeToAllDay.title);
		// the next ones are the one fromAllDayToTime and the one fromTimeToTime since they are both for tenMinutesFromNow
		expect(taskTitles[1]).toHaveTextContent(fromAllDayToTime.title);
		expect(taskTitles[2]).toHaveTextContent(fromTimeToTime.title);
	});

	test('If the task is updated but the reminder is kept the same, show the reminder in the same position inside the modal', async () => {
		const now = Date.now();
		const fiveMinutesFromNow = addMinutes(now, 5).getTime();
		const tenMinutesFromNow = addMinutes(now, 10).getTime();
		const tasks = populateTaskList(4);
		tasks.forEach((task, index) => {
			// eslint-disable-next-line no-param-reassign
			task.reminderAt = fiveMinutesFromNow;
			// eslint-disable-next-line no-param-reassign
			task.reminderAllDay = false;
			// eslint-disable-next-line no-param-reassign
			task.title = `Task 5 minutes index ${index}`;
		});
		tasks[3].title = 'Task 10 minutes';
		tasks[3].reminderAt = tenMinutesFromNow;
		const taskToEdit = tasks[1];
		const mocks = [mockFindTasks({ status: Status.Open }, tasks)];
		const { user } = setup(<RemindersManager />, { mocks });
		act(() => {
			jest.advanceTimersByTime(fiveMinutesFromNow - now);
		});
		await waitForModalToOpen();
		let taskTitles = screen.getAllByText(/task 5 minutes/i);
		expect(taskTitles).toHaveLength(3);
		expect(taskTitles[1]).toHaveTextContent(taskToEdit.title);
		await user.click(screen.getByRole('button', { name: /dismiss/i }));
		const newTitle = 'Task 5 minutes index 1 edited';
		await editTask({ ...taskToEdit, title: newTitle });
		act(() => {
			jest.advanceTimersByTime(tenMinutesFromNow - fiveMinutesFromNow);
		});
		await waitForModalToOpen();
		taskTitles = screen.getAllByText(/task 5 minutes/i);
		expect(taskTitles).toHaveLength(3);
		expect(taskTitles[1]).toHaveTextContent(newTitle);
		expect(screen.queryByText(taskToEdit.title)).not.toBeInTheDocument();
	});

	test('If the task is updated, show the reminder with the updated data inside the modal', async () => {
		const now = Date.now();
		const fiveMinutesFromNow = addMinutes(now, 5).getTime();
		const tenMinutesFromNow = addMinutes(now, 10).getTime();
		const task = populateTask({
			reminderAt: fiveMinutesFromNow,
			reminderAllDay: false,
			priority: Priority.Medium
		});
		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		const { user } = setup(<RemindersManager />, { mocks });
		act(() => {
			jest.advanceTimersByTime(fiveMinutesFromNow - now);
		});
		await waitForModalToOpen();
		await user.click(screen.getByRole('button', { name: /dismiss/i }));
		const updatedTask: Task = {
			...task,
			title: 'Updated title',
			priority: Priority.High,
			reminderAt: tenMinutesFromNow
		};
		await editTask(updatedTask);
		act(() => {
			jest.advanceTimersByTime(tenMinutesFromNow - fiveMinutesFromNow);
		});
		await waitForModalToOpen();
		expect(screen.getByText(updatedTask.title)).toBeVisible();
		expect(screen.queryByText(task.title)).not.toBeInTheDocument();
		expect(screen.getByTestId(ICON_REGEXP.highPriority)).toBeVisible();
		expect(screen.queryByTestId(ICON_REGEXP.mediumPriority)).not.toBeInTheDocument();
	});
});
