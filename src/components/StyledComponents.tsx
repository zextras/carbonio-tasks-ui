/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Row, Text, getColor } from '@zextras/carbonio-design-system';
import styled, { css, SimpleInterpolation } from 'styled-components';

import { LIST_ITEM_AVATAR_HEIGHT } from '../constants';

export const HoverContainer = styled(Row)`
	width: 100%;
`;

export const HoverBarContainer = styled(Row).attrs(({ height = '45%', width, theme }) => ({
	height,
	width: width || `calc(100% - ${LIST_ITEM_AVATAR_HEIGHT} - ${theme.sizes.padding.small})`
}))`
	display: none;
	position: absolute;
	top: 0;
	right: 0;
	background: linear-gradient(
		to right,
		transparent,
		${({ theme }): string => theme.palette.gray6.hover}
	);
`;

interface ListItemContainerProps {
	$contextualMenuActive?: boolean;
	$disabled?: boolean;
	$disableHover?: boolean;
}

export const ListItemContainer = styled(Container).attrs<
	ListItemContainerProps,
	{ backgroundColor?: string }
>(({ $contextualMenuActive, $disabled, theme }) => ({
	backgroundColor:
		($disabled && getColor('gray6.disabled', theme)) ||
		($contextualMenuActive && getColor('gray6.hover', theme)) ||
		undefined
}))<ListItemContainerProps>`
	position: relative;
	${HoverContainer} {
		background-color: ${({ backgroundColor }): SimpleInterpolation => backgroundColor};
	}
	${HoverBarContainer} {
		display: none;
	}

	${({ $disableHover, theme }): SimpleInterpolation =>
		!$disableHover &&
		css`
			&:hover {
				${HoverBarContainer} {
					display: flex;
				}

				${HoverContainer} {
					background-color: ${getColor('gray6.hover', theme)};
				}
			}
		`}
	${({ $disabled }): SimpleInterpolation =>
		!$disabled &&
		css`
			cursor: pointer;
		`};
`;

export const CenteredText = styled(Text)<{ $width?: string }>`
	text-align: center;
	width: ${({ $width }): string => $width || 'auto'};
`;

export const InlineText = styled(Text)`
	display: inline;
`;

export const TextWithLineHeight = styled(Text)`
	line-height: 1.5;
`;
