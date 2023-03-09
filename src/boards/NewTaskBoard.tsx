/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import { useMutation, useQuery } from '@apollo/client';
import {
	Button,
	Checkbox,
	type CheckboxProps,
	Container,
	DateTimePicker,
	type DateTimePickerProps,
	Icon,
	IconButton,
	Input,
	type InputProps,
	Padding,
	Select,
	type SelectItem,
	type SingleSelectionOnChange,
	Switch,
	type SwitchProps,
	TextArea,
	type TextAreaProps
} from '@zextras/carbonio-design-system';
import { useBoardHooks } from '@zextras/carbonio-shell-ui';
import { filter, find, noop, trim } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { CustomSelectLabelFactory } from '../components/CustomSelectLabelFactory';
import { NewTaskLimitBanner } from '../components/NewTaskLimitBanner';
import { TextExtended as Text } from '../components/Text';
import TASK from '../gql/fragments/task.graphql';
import {
	CreateTaskDocument,
	FindTasksDocument,
	type FindTasksQuery,
	Priority,
	Status,
	type TaskFragment
} from '../gql/types';
import { type NonNullableList } from '../types/utils';
import { identity } from '../views/app/TasksView';

const CustomIconButton = styled(IconButton)`
	padding: 0.125rem;
`;

const priorityItems: Array<SelectItem> = [
	{
		label: 'High',
		value: Priority.High,
		customComponent: (
			<Container width="fit" mainAlignment="flex-start" orientation="horizontal" gap={'1rem'}>
				<Icon icon="ArrowheadUp" color="error" />
				<Text>High</Text>
			</Container>
		)
	},
	{
		label: 'Medium',
		value: Priority.Medium,
		customComponent: (
			<Container width="fit" mainAlignment="flex-start" orientation="horizontal" gap={'1rem'}>
				<Icon icon="MinusOutline" color="gray1" />
				<Text>Medium</Text>
			</Container>
		)
	},
	{
		label: 'Low',
		value: Priority.Low,
		customComponent: (
			<Container width="fit" mainAlignment="flex-start" orientation="horizontal" gap={'1rem'}>
				<Icon icon="ArrowheadDown" color="info" />
				<Text>Low</Text>
			</Container>
		)
	}
];

function isPriorityValidValue(value: string): value is Priority {
	return (Object.values(Priority) as string[]).includes(value);
}

const NewTaskBoard = (): JSX.Element => {
	const [t] = useTranslation();
	const { closeBoard } = useBoardHooks();

	const { data: findTasksResult } = useQuery(FindTasksDocument, {
		fetchPolicy: 'cache-only',
		// set next fetch policy to cache-first so that re-renders does not trigger new network queries
		nextFetchPolicy: 'cache-first',
		notifyOnNetworkStatusChange: true,
		errorPolicy: 'all'
	});

	const tasks = useMemo((): NonNullableList<FindTasksQuery['findTasks']> => {
		if (findTasksResult?.findTasks && findTasksResult.findTasks.length > 0) {
			return filter(findTasksResult.findTasks, identity);
		}
		return [];
	}, [findTasksResult]);

	const [createTaskMutation] = useMutation(CreateTaskDocument);

	// title
	const [titleValue, setTitleValue] = useState('');

	const onTitleChange = useCallback<NonNullable<InputProps['onChange']>>((ev) => {
		setTitleValue(ev.target.value);
	}, []);

	// priority

	const [selectedPriority, setSelectedPriority] = useState(Priority.Medium);

	const onPriorityChange = useCallback<SingleSelectionOnChange>((value) => {
		if (value && isPriorityValidValue(value)) {
			setSelectedPriority(value);
		}
	}, []);

	const prioritySelection = useMemo(() => {
		const selectItem = find(priorityItems, ['value', selectedPriority]);
		if (selectItem) {
			return selectItem;
		}
		throw new Error('Invalid priority select item');
	}, [selectedPriority]);

	// reminder switch

	const [enableReminder, setEnableReminder] = useState(false);

	const onClickEnableReminder = useCallback<NonNullable<SwitchProps['onClick']>>(
		() => setEnableReminder((prevState) => !prevState),
		[]
	);

	// all day checkbox

	const [isAllDay, setIsAllDay] = useState(false);

	const onClickAllDayCheckbox = useCallback<NonNullable<CheckboxProps['onClick']>>(
		() => setIsAllDay((prevState) => !prevState),
		[]
	);

	// date picker
	const [date, setDate] = useState<Date | undefined>(new Date());

	const handleChange = useCallback<NonNullable<DateTimePickerProps['onChange']>>(
		(d: Date | null) => {
			if (d instanceof Date) {
				setDate(d);
			} else {
				setDate(undefined);
			}
		},
		[]
	);

	// description textArea
	const [descriptionValue, setDescriptionValue] = useState('');

	const onChangeDescription = useCallback<NonNullable<TextAreaProps['onChange']>>((event) => {
		setDescriptionValue(event.currentTarget.value);
	}, []);

	// create button disable check

	const isCreateDisabled = useMemo(
		() =>
			titleValue.length > 1024 || trim(titleValue).length === 0 || descriptionValue.length > 4096,
		[descriptionValue.length, titleValue]
	);

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
					label={'CREATE'}
					onClick={(): void => {
						createTaskMutation({
							variables: {
								newTask: {
									status: Status.Open,
									description:
										trim(descriptionValue).length > 0 ? trim(descriptionValue) : undefined,
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
											findTasks(existingTasksRefs) {
												const newLinkRef = cache.writeFragment<TaskFragment>({
													data: data.createTask,
													fragment: TASK
												});
												return [newLinkRef, ...existingTasksRefs];
											}
										}
									});
								}
							}
						});
						closeBoard();
					}}
				/>
			</Padding>
			{tasks.length >= 199 && <NewTaskLimitBanner />}
			<Container
				background="gray6"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				padding={{ horizontal: 'small', top: 'small' }}
				gap={'0.5rem'}
			>
				<Text weight={'bold'} overflow="ellipsis">
					{'Details'}
				</Text>
				<Container
					orientation={'horizontal'}
					height={'fit'}
					gap={'0.5rem'}
					crossAlignment={'flex-start'}
				>
					<Input
						label="Title*"
						backgroundColor="gray5"
						borderColor="gray3"
						value={titleValue}
						onChange={onTitleChange}
						hasError={titleValue.length > 1024}
						description={
							titleValue.length > 1024 ? 'Maximum length allowed is 1024 characters' : undefined
						}
					/>
					<Select
						items={priorityItems}
						background="gray5"
						label="Priority"
						onChange={onPriorityChange}
						selection={prioritySelection}
						LabelFactory={CustomSelectLabelFactory}
					/>
				</Container>
				<Switch value={enableReminder} onClick={onClickEnableReminder} label="Enable reminders" />

				{enableReminder && (
					<DateTimePicker
						width="fill"
						label="Reminder"
						defaultValue={date}
						includeTime={!isAllDay}
						onChange={handleChange}
						dateFormat={isAllDay ? 'MMMM d, yyyy' : 'MMMM d, yyyy HH:mm'}
						customInput={
							<Input
								backgroundColor={'gray4'}
								label="Reminder"
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
						label="Remind me at every login throughout the day"
					/>
				)}
				<Text weight={'bold'}>{'Description'}</Text>
				<TextArea
					label={'Task Description'}
					value={descriptionValue}
					onChange={onChangeDescription}
					hasError={descriptionValue.length > 4096}
					description={
						descriptionValue.length > 4096 ? 'Maximum length allowed is 4096 characters' : undefined
					}
				/>
			</Container>
		</Container>
	);
};

export default NewTaskBoard;
