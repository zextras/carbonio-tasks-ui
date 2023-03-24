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
import { Priority, Status, type Task } from '../gql/types';
import {
	mockFindTasks,
	mockUpdateTaskStatus,
	populateTask,
	populateTaskList
} from '../mocks/utils';
import { formatDateFromTimestamp } from '../utils';
import { setup } from '../utils/testUtils';

describe('Reminders manager', () => {
	function buildTask(reminderAt: Date | null, reminderAllDay: boolean): Task {
		const task = populateTask();
		task.reminderAt = reminderAt?.getTime() || null;
		task.reminderAllDay = reminderAllDay;
		return task;
	}

	async function waitForModalToOpen(): Promise<HTMLElement> {
		return screen.findByText(/tasks reminders/i);
	}

	test('On load show reminder which is set for today, before now, with a specific time', async () => {
		const todayBeforeNow = faker.date.between(startOfToday(), Date.now());
		const task = buildTask(todayBeforeNow, false);

		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		expect(
			screen.getByText(
				formatDateFromTimestamp(todayBeforeNow.getTime(), {
					timezone: TIMEZONE_DEFAULT,
					includeTime: true
				})
			)
		).toBeVisible();
		expect(screen.getByText(task.title)).toBeVisible();
	});

	test('On load show reminder set for today, before now, all day', async () => {
		const todayBeforeNow = faker.date.between(startOfToday(), Date.now());
		const task = buildTask(todayBeforeNow, true);

		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		expect(
			screen.getByText(
				formatDateFromTimestamp(todayBeforeNow.getTime(), {
					timezone: TIMEZONE_DEFAULT,
					includeTime: false
				})
			)
		).toBeVisible();
		expect(screen.getByText(task.title)).toBeVisible();
	});

	test('On load show reminder set for today, after now, all day', async () => {
		const todayAfterNow = faker.date.between(Date.now(), endOfToday());
		const task = buildTask(todayAfterNow, true);

		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		expect(
			screen.getByText(
				formatDateFromTimestamp(todayAfterNow.getTime(), {
					timezone: TIMEZONE_DEFAULT,
					includeTime: false
				})
			)
		).toBeVisible();
		expect(screen.getByText(task.title)).toBeVisible();
	});

	test('Show reminder set for today, after now, with specific time, only when it expires', async () => {
		const now = Date.now();
		const todayAfterNow = faker.date.between(now, endOfToday());
		const task = buildTask(todayAfterNow, false);
		const msDiffFromNow = todayAfterNow.getTime() - now;

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
				formatDateFromTimestamp(todayAfterNow.getTime(), {
					timezone: TIMEZONE_DEFAULT,
					includeTime: true
				})
			)
		).toBeVisible();
		expect(screen.getByText(task.title)).toBeVisible();
	});

	test('Does not show reminder set for yesterday, with specific time', async () => {
		const yesterday = faker.date.between(startOfYesterday(), endOfYesterday());
		const task = buildTask(yesterday, false);

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
				formatDateFromTimestamp(yesterday.getTime(), {
					timezone: TIMEZONE_DEFAULT,
					includeTime: true
				})
			)
		).not.toBeInTheDocument();
		expect(screen.queryByText(task.title)).not.toBeInTheDocument();
	});

	test('Does not show reminder set for yesterday, all day', async () => {
		const yesterday = faker.date.between(startOfYesterday(), endOfYesterday());
		const task = buildTask(yesterday, true);

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
				formatDateFromTimestamp(yesterday.getTime(), {
					timezone: TIMEZONE_DEFAULT,
					includeTime: false
				})
			)
		).not.toBeInTheDocument();
		expect(screen.queryByText(task.title)).not.toBeInTheDocument();
	});

	test('Does not show reminder set for tomorrow, with specific time', async () => {
		const tomorrow = faker.date.between(startOfTomorrow(), endOfTomorrow());
		const task = buildTask(tomorrow, false);

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
				formatDateFromTimestamp(tomorrow.getTime(), {
					timezone: TIMEZONE_DEFAULT,
					includeTime: true
				})
			)
		).not.toBeInTheDocument();
		expect(screen.queryByText(task.title)).not.toBeInTheDocument();
	});

	test('Does not show reminder set for tomorrow, all day', async () => {
		const tomorrow = faker.date.between(startOfTomorrow(), endOfTomorrow());
		const task = buildTask(tomorrow, true);

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
				formatDateFromTimestamp(tomorrow.getTime(), {
					timezone: TIMEZONE_DEFAULT,
					includeTime: false
				})
			)
		).not.toBeInTheDocument();
		expect(screen.queryByText(task.title)).not.toBeInTheDocument();
	});

	test('Does not show tasks without a reminder', async () => {
		const task1 = buildTask(null, false);
		const task2 = buildTask(null, true);
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
		const task = buildTask(new Date(), true);
		task.status = Status.Open;
		const findTasksMock = mockFindTasks({ status: Status.Open }, [task]);
		const mocks = [findTasksMock];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		expect(screen.getByText(task.title)).toBeVisible();
	});

	test('Does not show task with status completed', async () => {
		const task = buildTask(new Date(), true);
		task.status = Status.Complete;
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
		const todayAfterNow = faker.date.between(now, endOfToday());
		const task = buildTask(todayAfterNow, false);
		task.status = Status.Complete;
		const msDiffFromNow = todayAfterNow.getTime() - now;

		const findTaskMock = mockFindTasks({ status: Status.Open }, [task]);
		const mocks = [findTaskMock];
		setup(<RemindersManager />, { mocks });
		await waitFor(() => expect(findTaskMock.result).toHaveBeenCalled());
		act(() => {
			jest.advanceTimersByTime(msDiffFromNow);
		});
		expect(screen.queryByText(/tasks reminders/i)).not.toBeInTheDocument();
		expect(screen.queryByText(task.title)).not.toBeInTheDocument();
	});

	test('Dismiss action close the modal', async () => {
		const reminder = buildTask(new Date(), true);
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
		const reminder = buildTask(new Date(), true);
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
		const reminder = buildTask(new Date(), true);
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
		const allDay1 = buildTask(faker.date.between(now, endOfToday()), true);
		allDay1.title = 'Task item all day 1';
		const allDay2 = buildTask(faker.date.between(startOfToday(), now), true);
		allDay2.title = 'Task item all day 2';
		// with time must be before now to be visible on load, withTime1 is 1 minute before now, withTime2 is 5 minutes before now
		// make withTime1 and 2 have a difference of more than 1 minute between each other, otherwise they could end up in the same minute
		const oneMinuteAgo = subMinutes(now, 1);
		const fiveMinutesAgo = subMinutes(now, 5);
		const withTime1 = buildTask(oneMinuteAgo, false);
		withTime1.title = 'Task item with time 1';
		const withTime2 = buildTask(fiveMinutesAgo, false);
		withTime2.title = 'Task item with time 2';

		const mocks = [
			mockFindTasks({ status: Status.Open }, [allDay1, withTime1, allDay2, withTime2])
		];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		const allDayDate = formatDateFromTimestamp(now, {
			timezone: TIMEZONE_DEFAULT,
			includeTime: false
		});
		const aMinuteAgoDate = formatDateFromTimestamp(oneMinuteAgo.getTime(), {
			timezone: TIMEZONE_DEFAULT,
			includeTime: true
		});
		const fiveMinutesAgoDate = formatDateFromTimestamp(fiveMinutesAgo.getTime(), {
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
		const now = new Date();
		const allDayReminder = buildTask(now, true);
		allDayReminder.title = 'Task item all day';
		const withTimeExpired = buildTask(subMinutes(now, 1), false);
		withTimeExpired.title = 'Task item with time expired';
		const fiveMinutesFromNow = addMinutes(now, 5);
		const expiringReminder = buildTask(fiveMinutesFromNow, false);
		expiringReminder.title = 'Task item expiring';
		const mocks = [
			mockFindTasks({ status: Status.Open }, [allDayReminder, withTimeExpired, expiringReminder])
		];
		const { user } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		await user.click(screen.getByRole('button', { name: /dismiss/i }));
		act(() => {
			jest.advanceTimersByTime(fiveMinutesFromNow.getTime() - now.getTime());
		});
		await waitForModalToOpen();
		const visibleDates = screen.getAllByText(
			formatDateFromTimestamp(now.getTime(), {
				timezone: TIMEZONE_DEFAULT,
				includeTime: false
			}),
			{ exact: false }
		);
		expect(visibleDates[0]).toHaveTextContent(
			formatDateFromTimestamp(fiveMinutesFromNow.getTime(), {
				timezone: TIMEZONE_DEFAULT,
				includeTime: true
			})
		);
		const taskTitles = screen.getAllByText(/task item/i);
		expect(taskTitles[0]).toHaveTextContent(expiringReminder.title);
	});

	test('When multiple reminders expire together, show the reminders at first positions inside the modal', async () => {
		const now = new Date();
		const allDayReminder = buildTask(now, true);
		allDayReminder.title = 'Task item all day';
		const withTimeExpired = buildTask(subMinutes(now, 1), false);
		withTimeExpired.title = 'Task item with time expired';
		const fiveMinutesFromNow = addMinutes(now, 5);
		const expiringReminder1 = buildTask(fiveMinutesFromNow, false);
		expiringReminder1.title = 'Task item expiring 1';
		const expiringReminder2 = buildTask(fiveMinutesFromNow, false);
		expiringReminder2.title = 'Task item expiring 2';
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
			jest.advanceTimersByTime(fiveMinutesFromNow.getTime() - now.getTime());
		});
		await waitForModalToOpen();
		const visibleDates = screen.getAllByText(
			formatDateFromTimestamp(now.getTime(), {
				timezone: TIMEZONE_DEFAULT,
				includeTime: false
			}),
			{ exact: false }
		);
		const expiringRemindersDate = formatDateFromTimestamp(fiveMinutesFromNow.getTime(), {
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
		const now = new Date();
		const allDayReminder = buildTask(now, true);
		allDayReminder.title = 'Task item all day';
		const withTimeExpired = buildTask(subMinutes(now, 1), false);
		withTimeExpired.title = 'Task item with time expired';
		const fiveMinutesFromNow = addMinutes(now, 5);
		const expiringReminder = buildTask(fiveMinutesFromNow, false);
		expiringReminder.title = 'Task item expiring';
		const mocks = [
			mockFindTasks({ status: Status.Open }, [allDayReminder, withTimeExpired, expiringReminder])
		];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		act(() => {
			jest.advanceTimersByTime(fiveMinutesFromNow.getTime() - now.getTime());
		});
		const visibleDates = screen.getAllByText(
			formatDateFromTimestamp(now.getTime(), {
				timezone: TIMEZONE_DEFAULT,
				includeTime: false
			}),
			{ exact: false }
		);
		expect(visibleDates[2]).toHaveTextContent(
			formatDateFromTimestamp(fiveMinutesFromNow.getTime(), {
				timezone: TIMEZONE_DEFAULT,
				includeTime: true
			})
		);
		const taskTitles = screen.getAllByText(/task item/i);
		expect(taskTitles[2]).toHaveTextContent(expiringReminder.title);
	});

	test('When multiple reminders expire together with the modal already open, show the reminders at last positions inside the modal', async () => {
		const now = new Date();
		const allDayReminder = buildTask(now, true);
		allDayReminder.title = 'Task item all day';
		const withTimeExpired = buildTask(subMinutes(now, 1), false);
		withTimeExpired.title = 'Task item with time expired';
		const fiveMinutesFromNow = addMinutes(now, 5);
		const expiringReminder1 = buildTask(fiveMinutesFromNow, false);
		expiringReminder1.title = 'Task item expiring 1';
		const expiringReminder2 = buildTask(fiveMinutesFromNow, false);
		expiringReminder2.title = 'Task item expiring 2';
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
			jest.advanceTimersByTime(fiveMinutesFromNow.getTime() - now.getTime());
		});
		await waitForModalToOpen();
		const visibleDates = screen.getAllByText(
			formatDateFromTimestamp(now.getTime(), {
				timezone: TIMEZONE_DEFAULT,
				includeTime: false
			}),
			{ exact: false }
		);
		const expiringRemindersDate = formatDateFromTimestamp(fiveMinutesFromNow.getTime(), {
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
		const now = new Date();
		const allDayReminder = buildTask(now, true);
		allDayReminder.title = 'Task item all day';
		const withTimeExpired = buildTask(subMinutes(now, 1), false);
		withTimeExpired.title = 'Task item with time expired';
		const fiveMinutesFromNow = addMinutes(now, 5);
		const expiringReminder1 = buildTask(fiveMinutesFromNow, false);
		expiringReminder1.title = 'Task item expiring 1';
		const tenMinutesFromNow = addMinutes(now, 10);
		const expiringReminder2 = buildTask(tenMinutesFromNow, false);
		expiringReminder2.title = 'Task item expiring 2';
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
			jest.advanceTimersByTime(fiveMinutesFromNow.getTime() - now.getTime());
		});
		await waitForModalToOpen();
		expect(screen.getByText(expiringReminder1.title)).toBeVisible();
		expect(screen.queryByText(expiringReminder2.title)).not.toBeInTheDocument();
		act(() => {
			jest.advanceTimersByTime(tenMinutesFromNow.getTime() - fiveMinutesFromNow.getTime());
		});
		const visibleDates = screen.getAllByText(
			formatDateFromTimestamp(now.getTime(), {
				timezone: TIMEZONE_DEFAULT,
				includeTime: false
			}),
			{ exact: false }
		);
		const fiveMinutesFromNowDate = formatDateFromTimestamp(fiveMinutesFromNow.getTime(), {
			timezone: TIMEZONE_DEFAULT,
			includeTime: true
		});
		const tenMinutesFromNowDate = formatDateFromTimestamp(tenMinutesFromNow.getTime(), {
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
		const task = populateTask();
		task.reminderAt = Date.now();
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
		const task = populateTask();
		task.reminderAt = Date.now();
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
		const task = populateTask();
		task.reminderAt = Date.now();
		task.priority = Priority.Medium;
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
		const task = populateTask();
		task.reminderAt = Date.now();
		task.priority = Priority.Medium;
		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		const { queryByRoleWithIcon } = setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		expect(
			queryByRoleWithIcon('button', { icon: ICON_REGEXP.reminderUndoAction })
		).not.toBeInTheDocument();
	});

	test.skip('Priority is hidden for a task completed', async () => {
		const task = populateTask();
		task.reminderAt = Date.now();
		task.priority = Priority.Medium;
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
		const task = populateTask();
		task.reminderAt = Date.now();
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
		const task = populateTask();
		task.reminderAt = Date.now();
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
		const allDay = buildTask(new Date(), true);
		const withTime = buildTask(subMinutes(Date.now(), 5), false);
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
		const allDay = buildTask(new Date(), true);
		const withTime = buildTask(subMinutes(Date.now(), 5), false);
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
		const allDay = buildTask(new Date(), true);
		const withTime = buildTask(subMinutes(Date.now(), 5), false);
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
		const allDay = buildTask(new Date(), true);
		const withTime = buildTask(subMinutes(Date.now(), 5), false);
		const now = Date.now();
		const fiveMinutesFromNow = addMinutes(now, 5);
		const expiring = buildTask(fiveMinutesFromNow, false);
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
			jest.advanceTimersByTime(fiveMinutesFromNow.getTime() - now);
		});
		await screen.findByText(expiring.title);
		expect(undoAllButton).not.toBeInTheDocument();
		expect(completeAllButton).toBeVisible();
	});

	test('Complete all action is not visible if there is only one task in the list', async () => {
		const task = populateTask();
		task.reminderAt = Date.now();
		const mocks = [mockFindTasks({ status: Status.Open }, [task])];
		setup(<RemindersManager />, { mocks });
		await waitForModalToOpen();
		expect(screen.queryByRole('button', { name: /complete all/i })).not.toBeInTheDocument();
	});

	test.skip('Undo all action is not visible if there is only one task in the list', async () => {
		const task = populateTask();
		task.reminderAt = Date.now();
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

	test('A sound is played when the modal is shown on load', async () => {
		const task = populateTask();
		task.reminderAt = faker.date.between(startOfToday(), Date.now()).getTime();
		task.reminderAllDay = false;
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
		const task = populateTask();
		task.reminderAt = addMinutes(Date.now(), 1).getTime();
		task.reminderAllDay = false;
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

	test.todo(
		'[Move up to the view] Does not open the modal when a reminders expires if it is set as completed'
	);

	test.todo(
		'[Move up to the view] When the reminder of a task is edited to be in the future, the reminder modal is shown on the new datetime'
	);
	test.todo(
		'[Move up to the view] When the reminder of a task is edited to be in the past, the reminder modal is not shown'
	);
	test.todo(
		'[Move up to the view] When the reminder of a task is edited and disabled, the reminder modal is not shown'
	);
});
