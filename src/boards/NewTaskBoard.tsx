/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import { type Reference, useMutation, useQuery } from '@apollo/client';
import { type Modifier } from '@apollo/client/cache';
import {
	Button,
	type ButtonProps,
	Checkbox,
	type CheckboxProps,
	Container,
	DateTimePicker,
	type DateTimePickerProps,
	Icon,
	IconButton,
	type IconProps,
	Input,
	type InputProps,
	Padding,
	Select,
	type SelectItem,
	type SingleSelectionOnChange,
	Switch,
	type SwitchProps,
	TextArea,
	type TextAreaProps,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useBoardHooks, t } from '@zextras/carbonio-shell-ui';
import { filter, find, noop, trim } from 'lodash';
import styled from 'styled-components';

import { CustomSelectLabelFactory } from '../components/CustomSelectLabelFactory';
import { NewTaskLimitBanner } from '../components/NewTaskLimitBanner';
import { TextExtended as Text } from '../components/Text';
import {
	ALL_DAY_DATE_TIME_PICKER_DATE_FORMAT,
	MAX_TASKS_LIMIT,
	TASK_DESCRIPTION_MAX_LENGTH,
	TASK_TITLE_MAX_LENGTH,
	TIME_SPECIFIC_DATE_TIME_PICKER_DATE_FORMAT
} from '../constants';
import {
	CreateTaskDocument,
	FindTasksDocument,
	type FindTasksQuery,
	Priority,
	Status,
	type Task
} from '../gql/types';
import { type NonNullableList } from '../types/utils';
import { identity } from '../utils';

const CustomIconButton = styled(IconButton)`
	padding: 0.125rem;
`;

const PrioritySelectionItem = ({
	icon,
	iconColor,
	label
}: {
	icon: IconProps['icon'];
	iconColor: IconProps['color'];
	label: string;
}): JSX.Element => (
	<Container width="fit" mainAlignment="flex-start" orientation="horizontal" gap={'1rem'}>
		<Icon icon={icon} color={iconColor} />
		<Text>{label}</Text>
	</Container>
);

const priorityItems: Array<SelectItem> = [
	{
		label: t('board.create.priority.high', 'High'),
		value: Priority.High,
		customComponent: (
			<PrioritySelectionItem
				icon={'ArrowheadUp'}
				iconColor={'error'}
				label={t('board.create.priority.high', 'High')}
			/>
		)
	},
	{
		label: t('board.create.priority.medium', 'Medium'),
		value: Priority.Medium,
		customComponent: (
			<PrioritySelectionItem
				icon={'MinusOutline'}
				iconColor={'gray1'}
				label={t('board.create.priority.medium', 'Medium')}
			/>
		)
	},
	{
		label: t('board.create.priority.low', 'Low'),
		value: Priority.Low,
		customComponent: (
			<PrioritySelectionItem
				icon={'ArrowheadDown'}
				iconColor={'info'}
				label={t('board.create.priority.low', 'Low')}
			/>
		)
	}
];

const addTaskToList: (task: Task) => Modifier<Reference[] | undefined> =
	(task) =>
	(existingTasksRefs, { toReference }) => {
		const newTaskRef = toReference(task);
		if (existingTasksRefs && newTaskRef) {
			return [newTaskRef, ...existingTasksRefs];
		}
		return existingTasksRefs;
	};

function isPriorityValidValue(value: string): value is Priority {
	return (Object.values(Priority) as string[]).includes(value);
}

const NewTaskBoard = (): JSX.Element => {
	const { closeBoard } = useBoardHooks();
	const createSnackbar = useSnackbar();

	const { data: findTasksResult } = useQuery(FindTasksDocument, {
		fetchPolicy: 'cache-first',
		notifyOnNetworkStatusChange: true,
		errorPolicy: 'all'
	});

	const tasks = useMemo(
		(): NonNullableList<FindTasksQuery['findTasks']> =>
			filter(findTasksResult?.findTasks, identity),
		[findTasksResult]
	);

	const [createTaskMutation] = useMutation(CreateTaskDocument);

	const [titleValue, setTitleValue] = useState('');

	const onTitleChange = useCallback<NonNullable<InputProps['onChange']>>((ev) => {
		setTitleValue(ev.target.value);
	}, []);

	const [selectedPriority, setSelectedPriority] = useState(Priority.Medium);

	const onPriorityChange = useCallback<SingleSelectionOnChange>((value) => {
		if (value && isPriorityValidValue(value)) {
			setSelectedPriority(value);
		}
	}, []);

	const prioritySelection = useMemo(() => {
		const selectItem = find(
			priorityItems,
			(priorityItem) => priorityItem.value === selectedPriority
		);
		if (selectItem) {
			return selectItem;
		}
		console.error('Invalid priority select item');
		return priorityItems[1];
	}, [selectedPriority]);

	const [enableReminder, setEnableReminder] = useState(false);

	const onClickEnableReminder = useCallback<NonNullable<SwitchProps['onClick']>>(
		() => setEnableReminder((prevState) => !prevState),
		[]
	);

	const [isAllDay, setIsAllDay] = useState(false);

	const onClickAllDayCheckbox = useCallback<NonNullable<CheckboxProps['onClick']>>(
		() => setIsAllDay((prevState) => !prevState),
		[]
	);

	const [date, setDate] = useState<Date | null>(new Date());

	const handleChange = useCallback<NonNullable<DateTimePickerProps['onChange']>>((newDateValue) => {
		setDate(newDateValue);
	}, []);

	const [descriptionValue, setDescriptionValue] = useState('');

	const onChangeDescription = useCallback<NonNullable<TextAreaProps['onChange']>>((event) => {
		setDescriptionValue(event.currentTarget.value);
	}, []);

	const isCreateDisabled = useMemo(
		() =>
			titleValue.length > TASK_TITLE_MAX_LENGTH ||
			trim(titleValue).length === 0 ||
			descriptionValue.length > TASK_DESCRIPTION_MAX_LENGTH,
		[descriptionValue.length, titleValue]
	);

	const onClickCreateButton = useCallback<NonNullable<ButtonProps['onClick']>>(() => {
		if (tasks.length >= MAX_TASKS_LIMIT) {
			createSnackbar({
				key: new Date().toLocaleString(),
				type: 'warning',
				label: t(
					'snackbar.tasksLimitReached',
					'You have reached your 200 tasks. To create more complete your previous tasks.'
				),
				replace: false,
				hideButton: true
			});
		} else {
			createTaskMutation({
				variables: {
					newTask: {
						status: Status.Open,
						description: trim(descriptionValue).length > 0 ? trim(descriptionValue) : undefined,
						priority: selectedPriority,
						title: titleValue,
						reminderAt: enableReminder ? date?.getTime() : undefined,
						reminderAllDay: enableReminder ? isAllDay : undefined
					}
				},
				update(cache, { data }) {
					if (data?.createTask) {
						cache.modify({
							fields: {
								findTasks: addTaskToList(data.createTask)
							}
						});
					}
				}
			});
			closeBoard();
		}
	}, [
		closeBoard,
		createSnackbar,
		createTaskMutation,
		date,
		descriptionValue,
		enableReminder,
		isAllDay,
		selectedPriority,
		tasks.length,
		titleValue
	]);

	return (
		<Container
			crossAlignment={'flex-end'}
			background="gray5"
			padding={{ horizontal: 'large', bottom: '2.625rem' }}
		>
			<Padding vertical={'small'}>
				<Button
					disabled={isCreateDisabled}
					size="medium"
					label={t('board.create.confirmButton.create', 'create')}
					onClick={onClickCreateButton}
				/>
			</Padding>
			{tasks.length >= MAX_TASKS_LIMIT - 1 && <NewTaskLimitBanner />}
			<Container
				background="gray6"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				padding={{ horizontal: 'small', top: 'small' }}
				gap={'0.5rem'}
			>
				<Text weight={'bold'} overflow="ellipsis">
					{t('board.create.label.details', 'Details')}
				</Text>
				<Container
					orientation={'horizontal'}
					height={'fit'}
					gap={'0.5rem'}
					crossAlignment={'flex-start'}
				>
					<Input
						label={t('board.create.input.title.label', 'Title*')}
						backgroundColor="gray5"
						borderColor="gray3"
						value={titleValue}
						onChange={onTitleChange}
						hasError={titleValue.length > TASK_TITLE_MAX_LENGTH}
						description={
							titleValue.length > TASK_TITLE_MAX_LENGTH
								? t(
										'board.create.input.description.error.label',
										'Maximum length allowed is 1024 characters'
								  )
								: undefined
						}
					/>
					<Select
						items={priorityItems}
						background="gray5"
						label={t('board.create.select.priority.label', 'Priority')}
						onChange={onPriorityChange}
						selection={prioritySelection}
						LabelFactory={CustomSelectLabelFactory}
					/>
				</Container>
				<Switch
					value={enableReminder}
					onClick={onClickEnableReminder}
					label={t('board.create.switch.enableReminder.label', 'Enable reminders')}
				/>

				{enableReminder && (
					<DateTimePicker
						width="fill"
						label={t('board.create.dateTimePicker.reminder.label', 'Reminder')}
						defaultValue={date || undefined}
						includeTime={!isAllDay}
						onChange={handleChange}
						dateFormat={
							isAllDay
								? ALL_DAY_DATE_TIME_PICKER_DATE_FORMAT
								: TIME_SPECIFIC_DATE_TIME_PICKER_DATE_FORMAT
						}
						// TODO remove when CDS-140 is done
						customInput={
							<Input
								backgroundColor={'gray4'}
								label={t('board.create.dateTimePicker.reminder.label', 'Reminder')}
								CustomIcon={(): JSX.Element => (
									<CustomIconButton
										icon="CalendarOutline"
										size="large"
										backgroundColor="transparent"
										onClick={noop}
									/>
								)}
							/>
						}
					/>
				)}
				{enableReminder && (
					<Checkbox
						value={isAllDay}
						onClick={onClickAllDayCheckbox}
						label={t(
							'board.create.checkbox.allDay.label',
							'Remind me at every login throughout the day'
						)}
					/>
				)}
				<Text weight={'bold'}>{t('board.create.label.description', 'Description')}</Text>
				<TextArea
					label={t('board.create.textArea.taskDescription.label', 'Task Description')}
					value={descriptionValue}
					onChange={onChangeDescription}
					hasError={descriptionValue.length > TASK_DESCRIPTION_MAX_LENGTH}
					description={
						descriptionValue.length > TASK_DESCRIPTION_MAX_LENGTH
							? t(
									'board.create.textArea.description.error.label',
									'Maximum length allowed is 4096 characters'
							  )
							: undefined
					}
				/>
			</Container>
		</Container>
	);
};

export default NewTaskBoard;
