/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import {
	Text,
	type TextProps,
	TextWithTooltip,
	type TextWithTooltipProps
} from '@zextras/carbonio-design-system';
import styled, { type SimpleInterpolation } from 'styled-components';

import type { MakeOptional } from '../gql/types';

interface TextExtendedProps {
	width?: string;
	centered?: boolean;
	italic?: boolean;
	inline?: boolean;
	lineHeight?: number;
}

type WithDollarPrefix<S extends string> = `$${S}`;

type WithoutDollarPrefix<S extends string> = S extends `$${infer WithoutDollarString}`
	? WithoutDollarString
	: S;

type StyledTextProps = {
	[K in WithDollarPrefix<
		keyof Omit<TextExtendedProps, 'withTooltip'>
	>]: TextExtendedProps[WithoutDollarPrefix<K>];
};

type TextWithOptionalTooltipProps =
	| ({ withTooltip: true } & MakeOptional<TextWithTooltipProps, 'children'>)
	| ({ withTooltip?: false } & TextProps);

const TextWithOptionalTooltip = ({
	withTooltip,
	children = null,
	...rest
}: TextWithOptionalTooltipProps): JSX.Element =>
	withTooltip ? (
		<TextWithTooltip {...rest}>{children}</TextWithTooltip>
	) : (
		<Text {...rest}>{children}</Text>
	);

const StyledText = styled(TextWithOptionalTooltip)<StyledTextProps>`
	width: ${({ $width }): SimpleInterpolation => $width};
	display: ${({ $inline }): SimpleInterpolation => $inline && 'inline'};
	font-style: ${({ $italic }): SimpleInterpolation => $italic && 'italic'};
	text-align: ${({ $centered }): SimpleInterpolation => $centered && 'center'};
	line-height: ${({ $lineHeight }): SimpleInterpolation => $lineHeight};
`;
export const TextExtended = ({
	width,
	centered,
	italic,
	inline,
	lineHeight = 1.5,
	withTooltip = false,
	...dsProps
}: TextExtendedProps & TextWithOptionalTooltipProps): JSX.Element => (
	<StyledText
		$width={width}
		$centered={centered}
		$italic={italic}
		$inline={inline}
		$lineHeight={lineHeight}
		withTooltip={withTooltip}
		{...dsProps}
	/>
);
