/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Icon } from '@zextras/carbonio-design-system';

import { Priority } from '../gql/types';

interface PriorityIconProps {
	priority: Priority;
}
export const PriorityIcon = ({ priority }: PriorityIconProps): React.JSX.Element => (
	<>
		{priority === Priority.High && <Icon icon="ArrowheadUp" color="error" />}
		{priority === Priority.Low && <Icon icon="ArrowheadDown" color="info" />}
		{priority === Priority.Medium && <Icon icon="MinusOutline" color="gray1" />}
	</>
);
