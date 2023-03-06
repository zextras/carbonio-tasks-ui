/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Row, Text } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

export const HoverContainer = styled(Row)`
	width: 100%;
`;

export const HoverBarContainer = styled(Row)`
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

export const ListItemContainer = styled(Container)`
	position: relative;
	cursor: pointer;
	${HoverBarContainer} {
		display: none;
	}

	&:hover {
		${HoverBarContainer} {
			display: flex;
		}
	}
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
