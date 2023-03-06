/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

export const ListContext = createContext<{
	isFull: boolean;
	setIsFull?: (full: boolean) => void;
}>({
	isFull: false,
	setIsFull: () => {
		// not implemented
	}
});
