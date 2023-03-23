/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Modal } from '@zextras/carbonio-design-system';
import { getNotificationManager } from '@zextras/carbonio-shell-ui';
import { isAfter, isBefore, isToday, startOfDay } from 'date-fns';
import { chain, differenceBy, flatMap, flatten, forEach, groupBy, map, remove, some } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ReminderModalContent } from './ReminderModalContent';
import { ReminderModalFooter } from './ReminderModalFooter';
import { TimeZoneContext } from '../contexts';
import { FindTasksDocument, Status, type Task, UpdateTaskStatusDocument } from '../gql/types';
import { debounceWithAllArgs, formatDateFromTimestamp } from '../utils';

/*
 * TODO manage reminders
 * opzione 1:
 * (OK) quando viene registrato un nuovo task o modificato un task esistente, se il reminder non e' passato,
 * registra il task in una lista di reminders.
 * (OK) Su questi task viene registrato un timer uguale alla differenza tra ora e il momento del reminder.
 * (OK) Allo scadere del timer, viene lanciata una funzione showReminder che aggiungere il reminder alla lista di quelli da mostrare.
 * I reminder da mostrare sono filtrati ad ogni apertura, per escludere i reminder passati non piu' validi (quelli del giorno precedente).
 * (OK) Ogni volta che la funzione showReminder viene chiamata, aggiorna la lista. Se il modale e' chiuso, apre il modale.
 * (OK) Se il modale era gia' aperto, la lista viene aggiornata (da confermare con Eugenia).
 *
 */

/*
 * Carico i task dalla cache, questo mi permette di rimanere in ascolto sulle modifiche che vengono fatte alla lista, quindi inserimenti e rimozioni.
 * Devo trovare pero' il modo di essere aggiornato anche sulle modifiche ai singoli task, in quanto l'edit non aggiorna i riferimenti della lista,
 * ma aggiorna l'oggetto task all'interno della cache stessa.
 *
 *
 */

type TaskWithReminder = Pick<Task, 'id' | 'title' | 'priority' | 'reminderAllDay' | 'status'> & {
	reminderAt: NonNullable<Task['reminderAt']>;
};

type ReminderEntity = TaskWithReminder & {
	_reminderTimeout: NodeJS.Timeout | null;
	getKey(timezone: string): string;
	/** Whether the reminder is within the range of time inside which it has to be shown to the user */
	isVisible(): boolean;
	/** Whether the reminder is valid to trigger a notification */
	isValid(): boolean;
	/** Start the timeout for the reminder */
	startTimeout(callback: (...reminders: ReminderEntity[]) => void): NodeJS.Timeout | null;
	/** Clear the timeout for the reminder */
	clearTimout(): void;
	/** Identify reminders which have already been shown from the ones which have not */
	hasAlreadyBeenReminded(): boolean;
};

function buildReminderEntity(task: TaskWithReminder): ReminderEntity {
	return {
		...task,
		_reminderTimeout: null,
		getKey(timezone: string): string {
			return formatDateFromTimestamp(task.reminderAt, {
				includeTime: task.reminderAllDay !== true,
				timezone
			});
		},
		isVisible(): boolean {
			// show only reminders of the current day
			return (
				isToday(task.reminderAt) && (task.reminderAllDay || isBefore(task.reminderAt, Date.now()))
			);
		},
		isValid(): boolean {
			// reminder could trigger a notification if it is set for the current day, but also for the future,
			// because session could be open at midnight, and at that moment the reminders of
			// tomorrow should be shown instead of the one of today
			return isToday(task.reminderAt) || isAfter(task.reminderAt, Date.now());
		},
		startTimeout(callback): NodeJS.Timeout | null {
			// start a timeout to trigger the reminder only when the reminder is in the future or in the current moment
			const reminderTime = task.reminderAllDay
				? startOfDay(task.reminderAt).getTime()
				: task.reminderAt;
			const epochDiffFromNow = reminderTime - Date.now();
			if (epochDiffFromNow >= 0) {
				this._reminderTimeout = setTimeout(callback, epochDiffFromNow, this);
			}
			return this._reminderTimeout;
		},
		clearTimout(): void {
			if (this._reminderTimeout) {
				clearTimeout(this._reminderTimeout);
			}
		},
		hasAlreadyBeenReminded(): boolean {
			return this._reminderTimeout === null;
		}
	} satisfies ReminderEntity;
}

function isTaskWithReminder(task: Partial<Task> | null | undefined): task is TaskWithReminder {
	return typeof task?.reminderAt === 'number';
}

export const RemindersManager = (): JSX.Element => {
	const [t] = useTranslation();
	const timezone = useContext(TimeZoneContext);
	const notificationManager = getNotificationManager();

	// query used to register new task when the list changes
	const { data: remindersData, previousData: remindersPreviousData } = useQuery(FindTasksDocument, {
		variables: {
			status: Status.Open
		},
		fetchPolicy: 'cache-only',
		errorPolicy: 'all'
	});
	// lazy query used to load data at first load
	const [findRemindersLazyQuery] = useLazyQuery(FindTasksDocument, {
		variables: { status: Status.Open }
	});
	const [updateTaskStatus] = useMutation(UpdateTaskStatusDocument);
	const [isModalOpen, setModalOpen] = useState<boolean>(false);
	// array of group of reminders. Each group represents a date block,
	// with the date formatted and the list of reminders for that date
	const [modalReminders, setModalReminders] = useState<
		Array<{ date: string; reminders: TaskWithReminder[] }>
	>([]);
	// map of tasks keyed by reminder date (formatted)
	const remindersByDateRef = useRef<Record<string, ReminderEntity[]>>({});

	const getVisibleReminders = useCallback(
		() =>
			// Extract all reminders which have to be shown and order them by date ascending.
			// Exclude from this list the ones which have an active timer
			chain(remindersByDateRef.current)
				.reduce<typeof modalReminders>((accumulator, reminderGroup, dateKey) => {
					if (reminderGroup.length > 0) {
						// show reminders which are visible (check only first one since they are grouped by datetime)
						if (reminderGroup[0].isVisible()) {
							// Pick only reminders which cannot trigger a notification anymore. In other words,
							// filter out reminders with an active timout, which need to be shown in a different group
							const remindersToShow = reminderGroup.filter((reminder) =>
								reminder.hasAlreadyBeenReminded()
							);
							if (remindersToShow.length > 0) {
								accumulator.push({
									date: dateKey,
									reminders: remindersToShow
								});
							}
						}
					}
					return accumulator;
				}, [])
				// sort reminders by date. All day entries are shown as first group for the day
				.sortBy((reminderModalEntry) => reminderModalEntry.date)
				.value(),
		[]
	);

	const _showReminder = useCallback(
		(...reminders: ReminderEntity[]): void => {
			setModalOpen((alreadyOpen) => {
				const remindersByDate = groupBy(reminders, (reminder) => reminder.getKey(timezone));
				const taskReminderEntries = map(remindersByDate, (reminderGroup, dateKey) => ({
					date: dateKey,
					reminders: reminderGroup
				}));
				if (alreadyOpen) {
					// place new reminders on bottom of the existing list
					setModalReminders((prevState) => [...prevState, ...taskReminderEntries]);
					// keep modal open
					return true;
				}
				const remindersByDateList = getVisibleReminders();
				// re-build list entirely and place new reminders on top
				setModalReminders([...taskReminderEntries, ...remindersByDateList]);
				// open modal if there is something to show
				return remindersByDateList.length + taskReminderEntries.length > 0;
			});
			// reset timout for reminders shown with this call so that they result as already seen in next modals
			forEach(reminders, (reminder) => {
				reminder.clearTimout();
			});
		},
		[getVisibleReminders, timezone]
	);

	const showReminderDebounced = useMemo(() => debounceWithAllArgs(_showReminder), [_showReminder]);

	const registerReminder = useCallback(
		(reminder: ReminderEntity): void => {
			const remindersByDate = remindersByDateRef.current;
			const dateKey = reminder.getKey(timezone);
			if (remindersByDate[dateKey] === undefined) {
				remindersByDate[dateKey] = [];
			}
			// add reminder to the map only if it is not completed, and it is not already registered
			if (
				reminder.status !== Status.Complete &&
				!some(
					remindersByDate[dateKey],
					(registeredReminder) => registeredReminder.id === reminder.id
				)
			) {
				reminder.startTimeout(showReminderDebounced);
				remindersByDate[dateKey].push(reminder);
			}
		},
		[showReminderDebounced, timezone]
	);

	const unregisterReminder = useCallback(
		(reminder: ReminderEntity): void => {
			const remindersByDate = remindersByDateRef.current;
			const dateKey = reminder.getKey(timezone);
			if (remindersByDate[dateKey] !== undefined) {
				const removedItems = remove(
					remindersByDate[dateKey],
					(registeredReminder) => registeredReminder.id === reminder.id
				);
				forEach(removedItems, (item) => {
					// clear timout for the removed reminders
					item.clearTimout();
				});
			}
		},
		[timezone]
	);

	const registerRemindersFromTasks = useCallback(
		(tasks: Array<Partial<Task> | null>) => {
			forEach(tasks, (task) => {
				if (isTaskWithReminder(task)) {
					const reminder = buildReminderEntity(task);
					if (reminder.isValid()) {
						registerReminder(reminder);
					}
				}
			});
		},
		[registerReminder]
	);

	useEffect(() => {
		// init reminders manager by requesting all task with the lazy query
		remindersByDateRef.current = {};
		findRemindersLazyQuery()
			.then((result) => {
				if (result?.data?.findTasks) {
					registerRemindersFromTasks(result.data.findTasks);
				}
			})
			.then(() => {
				// show reminders on first load of the module
				showReminderDebounced();
			});

		return (): void => {
			// on unload cleanup timers
			const allReminders = flatten(Object.values(remindersByDateRef.current));
			allReminders.forEach((reminder) => {
				reminder.clearTimout();
			});
		};
	}, [findRemindersLazyQuery, registerRemindersFromTasks, showReminderDebounced]);

	useEffect(() => {
		// listen for changes on the list:
		// - remove those which have been removed (compare previous data with current one)
		// - register those which have been added (compare current data with previous one)
		const removedTasks = differenceBy(
			remindersPreviousData?.findTasks || [],
			remindersData?.findTasks || [],
			(task) => task?.id
		);
		removedTasks.forEach((task) => {
			if (isTaskWithReminder(task)) {
				const reminder = buildReminderEntity(task);
				unregisterReminder(reminder);
			}
		});
		const addedTasks = differenceBy(
			remindersData?.findTasks || [],
			remindersPreviousData?.findTasks || [],
			(task) => task?.id
		);
		registerRemindersFromTasks(addedTasks);
	}, [
		registerRemindersFromTasks,
		remindersData?.findTasks,
		remindersPreviousData?.findTasks,
		unregisterReminder
	]);

	useEffect(() => {
		if (isModalOpen) {
			// notify with a sound the opening of the modal
			notificationManager.notify({ showPopup: false, playSound: true });
		}
	}, [notificationManager, isModalOpen]);

	const closeModalHandler = useCallback(() => {
		setModalOpen(false);
		// TODO: close displayer if needed
	}, []);

	const completeTaskHandler = useCallback(
		(task: Pick<Task, 'id'>) => () => {
			// TODO: when completing a task, the task should disappear from the list and the displayer should be close
			//   Check how to accomplish it when:
			//    - the modal is opened in another module
			//    - the modal is opened in tasks module and displayer is opened in one of the tasks
			//    - the modal is opened in tasks module and displayer is opened in another task
			//    - the modal is opened in tasks module and displayer is closed
			//   Consider also the possibility of doing undo. The displayer should be closed only if
			//   the task is really completed when the modal is closed
			updateTaskStatus({
				variables: {
					id: task.id,
					status: Status.Complete
				}
			});
		},
		[updateTaskStatus]
	);

	const updateTaskToOpen = useCallback(
		(task: Pick<Task, 'id'>) => () => {
			updateTaskStatus({
				variables: {
					id: task.id,
					status: Status.Open
				}
			});
		},
		[updateTaskStatus]
	);

	const flatMapOfModalReminders = useMemo(
		() => flatMap(modalReminders, ({ reminders }) => reminders),
		[modalReminders]
	);

	const completeAllHandler = useCallback(() => {
		forEach(flatMapOfModalReminders, (reminder) => {
			if (reminder.status === Status.Open) {
				completeTaskHandler(reminder);
			}
		});
	}, [completeTaskHandler, flatMapOfModalReminders]);

	const undoAllHandler = useCallback(() => {
		forEach(flatMapOfModalReminders, (reminder) => {
			if (reminder.status === Status.Open) {
				completeTaskHandler(reminder);
			}
		});
	}, [completeTaskHandler, flatMapOfModalReminders]);

	const isActionForAllAvailable = useMemo(
		() => flatMapOfModalReminders.length > 1,
		[flatMapOfModalReminders]
	);

	const showCompleteAll = useMemo(
		() =>
			isActionForAllAvailable &&
			some(flatMapOfModalReminders, (reminder) => reminder.status !== Status.Complete),
		[flatMapOfModalReminders, isActionForAllAvailable]
	);

	const secondaryActionLabel = useMemo(
		() =>
			showCompleteAll
				? t('modal.reminder.completeAll', 'Complete all')
				: t('modal.reminder.undoAll', 'Undo all'),
		[showCompleteAll, t]
	);

	const secondaryActionHandler = useMemo(
		() => (showCompleteAll ? completeAllHandler : undoAllHandler),
		[completeAllHandler, showCompleteAll, undoAllHandler]
	);

	const secondaryActionIcon = useMemo(
		() => (showCompleteAll ? 'CheckmarkCircleOutline' : 'UndoOutline'),
		[showCompleteAll]
	);

	return (
		<Modal
			title={t('modal.reminder.title', 'Tasks reminders')}
			open={isModalOpen}
			onClose={closeModalHandler}
			closeIconTooltip={t('modal.close', 'Close')}
			customFooter={
				<ReminderModalFooter
					closeAction={closeModalHandler}
					showSecondaryAction={isActionForAllAvailable}
					secondaryAction={secondaryActionHandler}
					secondaryLabel={secondaryActionLabel}
					secondaryIcon={secondaryActionIcon}
				/>
			}
			maxHeight={'90vh'}
		>
			<ReminderModalContent
				reminders={modalReminders}
				completeAction={completeTaskHandler}
				undoCompleteAction={updateTaskToOpen}
			/>
		</Modal>
	);
};
