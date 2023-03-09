/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

import { TIMEZONE_DEFAULT } from '../constants';

export const ListContext = createContext<{
	isFull: boolean;
	setIsFull?: (full: boolean) => void;
}>({
	isFull: false,
	setIsFull: () => {
		// not implemented
	}
});

export const TimeZoneContext = createContext<string>(TIMEZONE_DEFAULT);
