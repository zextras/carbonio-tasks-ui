/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from '@emotion/styled';
import { Container, Row } from '@zextras/carbonio-design-system';

export const HoverContainer = styled(Row)``;

export const HoverBarContainer = styled(Container)`
	display: none;
	position: absolute;
	right: 0;
	background: linear-gradient(to right, transparent, currentColor 50%, currentColor 100%);
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
