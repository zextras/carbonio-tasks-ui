/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const ICON_REGEXP = {
	close: /^icon: CloseOutline$/i,
	highPriority: /^icon: ArrowheadUp$/i,
	lowPriority: /^icon: ArrowheadDown$/i,
	mediumPriority: /^icon: MinusOutline$/i,
	reminderExpired: /^icon: AlertTriangle$/i
} as const;

export const TEST_ID_SELECTOR = {
	tooltip: 'tooltip'
};
