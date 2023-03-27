/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useApolloClient, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Modal } from '@zextras/carbonio-design-system';
import { getNotificationManager } from '@zextras/carbonio-shell-ui';
import { isAfter, isBefore, isToday, startOfDay } from 'date-fns';
import {
	chain,
	cloneDeep,
	differenceBy,
	filter,
	find,
	findIndex,
	flatMap,
	flatten,
	forEach,
	groupBy,
	intersectionWith,
	isEqual,
	map,
	pullAt,
	reduce,
	remove,
	some
} from 'lodash';
import { useTranslation } from 'react-i18next';

import { ReminderModalContent } from './ReminderModalContent';
import { ReminderModalFooter } from './ReminderModalFooter';
import { removeTaskFromList } from '../apollo/cacheUtils';
import { TimeZoneContext } from '../contexts';
import { FindTasksDocument, Status, type Task, UpdateTaskStatusDocument } from '../gql/types';
import { useActiveItem } from '../hooks/useActiveItem';
import { debounceWithAllArgs, formatDateFromTimestamp } from '../utils';

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
				this._reminderTimeout = setTimeout(() => {
					callback(this);
				}, epochDiffFromNow);
			}
			return this._reminderTimeout;
		},
		clearTimout(): void {
			if (this._reminderTimeout) {
				clearTimeout(this._reminderTimeout);
				this._reminderTimeout = null;
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
	const apolloClient = useApolloClient();
	const { isActive, removeActive } = useActiveItem();

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
				if (alreadyOpen) {
					// Distinguish between new reminders and already existing reminders:
					// place new reminders on bottom of the existing list,
					// and keep already existing reminders at same position. For these, update only the status
					// (for now), in order to avoid having updated titles under a wrong reminder date.
					setModalReminders((prevState) => {
						const newState = cloneDeep(prevState);
						const newReminders: ReminderEntity[] = [];
						const prevRemindersFlat = flatMap(
							newState,
							(prevStateEntry) => prevStateEntry.reminders
						);
						forEach(reminders, (reminder) => {
							const existingReminder = find(
								prevRemindersFlat,
								(prevReminder) => prevReminder.id === reminder.id
							);
							if (existingReminder) {
								existingReminder.status = reminder.status;
							} else {
								newReminders.push(reminder);
							}
						});
						const remindersByDate = groupBy(newReminders, (reminder) => reminder.getKey(timezone));
						const newReminderEntries = map(remindersByDate, (reminderGroup, dateKey) => ({
							date: dateKey,
							reminders: reminderGroup
						}));
						if (newReminders.length > 0) {
							// notify with a sound the adding of a new reminder in the modal
							notificationManager.notify({ showPopup: false, playSound: true });
						}
						return [...newState, ...newReminderEntries];
					});
					// keep modal open
					return true;
				}
				const remindersByDate = groupBy(reminders, (reminder) => reminder.getKey(timezone));
				const reminderEntries = map(remindersByDate, (reminderGroup, dateKey) => ({
					date: dateKey,
					reminders: reminderGroup
				}));
				const remindersByDateList = getVisibleReminders();
				// re-build list entirely and place new reminders on top
				setModalReminders([...reminderEntries, ...remindersByDateList]);
				// open modal if there is something to show
				const shouldOpenModal = remindersByDateList.length + reminderEntries.length > 0;
				if (shouldOpenModal) {
					// notify with a sound the opening of the modal
					notificationManager.notify({ showPopup: false, playSound: true });
				}
				// reset timout for reminders shown with this call so that they result as already seen in next modals
				forEach(reminders, (reminder) => {
					reminder.clearTimout();
				});
				return shouldOpenModal;
			});
		},
		[getVisibleReminders, notificationManager, timezone]
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

	const updateRegisteredReminder = useCallback(
		(reminder: ReminderEntity): void => {
			const remindersByDate = remindersByDateRef.current;
			// find the previous position of the reminder by searching inside all the entries.
			// Retrieve both the dateKey and the index with a "reduce" to make a single cycle.
			// The two fields are both valued or both undefined, there cannot be a hybrid situation.
			const { prevKey, prevIndex } = reduce<
				typeof remindersByDate,
				{ prevKey: string; prevIndex: number } | { prevKey: undefined; prevIndex: undefined }
			>(
				remindersByDate,
				(result, reminders, key) => {
					const reminderIndex = findIndex(reminders, (item) => item.id === reminder.id);
					if (reminderIndex >= 0) {
						return { prevKey: key, prevIndex: reminderIndex };
					}
					return result;
				},
				{ prevKey: undefined, prevIndex: undefined }
			);

			const newDateKey = reminder.getKey(timezone);
			if (prevKey && remindersByDate[prevKey] !== undefined && prevIndex >= 0) {
				// if the reminder was truly registered
				// clear the timeout of the previous object
				remindersByDate[prevKey][prevIndex].clearTimout();
				if (reminder.status !== Status.Complete) {
					// if the status is still not complete, start the new timer
					reminder.startTimeout(showReminderDebounced);
					if (prevKey === newDateKey) {
						// update the reminder keeping the same position if the key is not changed (reminderAt and reminderAllDay are not changed)
						remindersByDate[prevKey][prevIndex] = reminder;
					} else {
						// otherwise clear the previous position and push the item to the new dateKey map
						pullAt(remindersByDate[prevKey], prevIndex);
						// delete the entry from the map if there is no reminder left for it
						if (remindersByDate[prevKey].length === 0) {
							delete remindersByDate[prevKey];
						}
						if (remindersByDate[newDateKey] === undefined) {
							remindersByDate[newDateKey] = [];
						}
						remindersByDate[newDateKey].push(reminder);
					}
				} else {
					// if the status has changed and now the task is completed, just clear the previous position
					pullAt(remindersByDate[prevKey], prevIndex);
				}
			} else {
				// if the reminder was not truly registered, register it
				registerReminder(reminder);
			}
		},
		[registerReminder, showReminderDebounced, timezone]
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
			showReminderDebounced.cancel();
		};
	}, [findRemindersLazyQuery, registerRemindersFromTasks, showReminderDebounced]);

	useEffect(() => {
		// listen for changes to the list which don't trigger an update of the modal:
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
		unregisterReminder,
		updateRegisteredReminder
	]);

	useEffect(() => {
		// listen for changes to the list which need to trigger an update of the modal:
		// - update registered reminders of those which reminder has been updated
		const modifiedTasks = intersectionWith(
			remindersData?.findTasks || [],
			remindersPreviousData?.findTasks || [],
			(newTask, prevTask) =>
				newTask !== null &&
				prevTask !== null &&
				newTask.id === prevTask.id &&
				!isEqual(newTask, prevTask)
		);
		const updatedReminders = modifiedTasks.reduce<ReminderEntity[]>((accumulator, task) => {
			if (isTaskWithReminder(task)) {
				const reminder = buildReminderEntity(task);
				updateRegisteredReminder(reminder);
				accumulator.push(reminder);
			}
			return accumulator;
		}, []);
		if (modifiedTasks.length > 0 && isModalOpen) {
			showReminderDebounced(...updatedReminders);
		}
	}, [
		isModalOpen,
		remindersData?.findTasks,
		remindersPreviousData?.findTasks,
		showReminderDebounced,
		updateRegisteredReminder
	]);

	const flatMapOfModalReminders = useMemo(
		() => flatMap(modalReminders, ({ reminders }) => reminders),
		[modalReminders]
	);

	const closeModalHandler = useCallback(() => {
		setModalOpen(false);
		const completedReminders = filter(
			flatMapOfModalReminders,
			(reminder) => reminder.status === Status.Complete
		);
		apolloClient.cache.modify({
			fields: {
				findTasks: removeTaskFromList(...completedReminders)
			}
		});
		if (some(completedReminders, (reminder) => isActive(reminder.id))) {
			removeActive({
				replace: true
			});
		}
	}, [apolloClient.cache, flatMapOfModalReminders, isActive, removeActive]);

	const completeTaskHandler = useCallback(
		(task: Pick<Task, 'id'>) => () => {
			updateTaskStatus({
				variables: {
					id: task.id,
					status: Status.Complete
				},
				optimisticResponse: {
					updateTask: {
						id: task.id,
						status: Status.Complete
					}
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
				},
				optimisticResponse: {
					updateTask: {
						id: task.id,
						status: Status.Open
					}
				}
			});
		},
		[updateTaskStatus]
	);

	const completeAllHandler = useCallback(() => {
		forEach(flatMapOfModalReminders, (reminder) => {
			if (reminder.status !== Status.Complete) {
				completeTaskHandler(reminder)();
			}
		});
	}, [completeTaskHandler, flatMapOfModalReminders]);

	const undoAllHandler = useCallback(() => {
		forEach(flatMapOfModalReminders, (reminder) => {
			if (reminder.status === Status.Complete) {
				updateTaskToOpen(reminder)();
			}
		});
	}, [flatMapOfModalReminders, updateTaskToOpen]);

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
