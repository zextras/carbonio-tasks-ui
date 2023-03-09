/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { type ComponentProps, useMemo } from 'react';

import {
	Container,
	Divider,
	getColor,
	Icon,
	Padding,
	Row,
	type SelectProps,
	Text
} from '@zextras/carbonio-design-system';
import { isEmpty } from 'lodash';
import styled, { css, type SimpleInterpolation } from 'styled-components';

import { Priority } from '../gql/types';

const CustomIcon = styled(Icon)`
	align-self: center;
	pointer-events: none;
`;

const Label = styled(Text)<{ $selected: boolean }>`
	position: absolute;
	top: ${({ $selected, theme }): string =>
		$selected ? `calc(${theme.sizes.padding.small} - 0.0625rem)` : '50%'};
	left: ${({ theme }): string => theme.sizes.padding.large};
	transform: translateY(${({ $selected }): string => ($selected ? '0' : '-50%')});
	transition: 150ms ease-out;
`;

const ContainerEl = styled(Container)<{ $focus: boolean }>`
	transition: background 0.2s ease-out;
	&:hover {
		background: ${({ theme }): string => getColor(`gray5.hover`, theme)};
	}
	${({ $focus, theme }): SimpleInterpolation =>
		$focus &&
		css`
			background: ${getColor(`gray5.focus`, theme)};
		`};
`;

const CustomText = styled(Text)`
	min-height: 1.167em;
	line-height: 1.5rem;
`;

export const CustomSelectLabelFactory: React.VFC<
	ComponentProps<NonNullable<SelectProps['LabelFactory']>>
> = ({ selected, label, open, focus, background, disabled }) => {
	const selectedLabels = useMemo(
		() =>
			!isEmpty(selected) &&
			selected.reduce<string[]>((arr, obj) => [...arr, obj.label], []).join(', '),
		[selected]
	);

	const selectedIcon = useMemo(() => {
		if (selected.length !== 1) {
			throw new Error('invalid selected length');
		}
		const priority = selected[0].value as Priority;
		return (
			(priority === Priority.Low && <Icon icon={'ArrowheadDown'} color="info" />) ||
			(priority === Priority.High && <Icon icon={'ArrowheadUp'} color="error" />) || (
				<Icon icon={'MinusOutline'} color="gray1" />
			)
		);
	}, [selected]);

	return (
		<>
			<ContainerEl
				orientation="horizontal"
				width="fill"
				crossAlignment="flex-end"
				mainAlignment="space-between"
				borderRadius="half"
				padding={{
					horizontal: 'large',
					top: 'small'
				}}
				background={background}
				$focus={focus}
			>
				<Row takeAvailableSpace mainAlignment="unset">
					<Padding top="medium" width="100%">
						<Container orientation={'horizontal'} mainAlignment={'flex-start'} gap={'1rem'}>
							{selectedIcon}
							<CustomText size="medium" color={disabled ? 'secondary' : 'text'}>
								{selectedLabels}
							</CustomText>
						</Container>
					</Padding>
					<Label
						$selected={!isEmpty(selected)}
						size={!isEmpty(selected) ? 'small' : 'medium'}
						color={(disabled && 'gray2') || ((open || focus) && 'primary') || 'secondary'}
					>
						{label}
					</Label>
				</Row>
				<CustomIcon
					size="medium"
					icon={open ? 'ArrowUp' : 'ArrowDown'}
					color={(disabled && 'gray2') || ((open || focus) && 'primary') || 'secondary'}
				/>
			</ContainerEl>
			<Divider color={open || focus ? 'primary' : 'gray2'} />
		</>
	);
};
