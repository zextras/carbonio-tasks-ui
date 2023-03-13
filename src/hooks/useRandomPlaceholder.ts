/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { type TOptions } from 'i18next';
import { debounce, isEqual, sample } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useMemoCompare } from './useMemoCompare';
import { RANDOM_PLACEHOLDER_TIMEOUT } from '../constants';
import { type OneOrMany } from '../types/utils';

export const useRandomPlaceholder = <TReturnType>(
	translationKey: string,
	tOptions: TOptions
): [randomPlaceholder: TReturnType | undefined, updateRandomPlaceholder: () => void] => {
	const [t] = useTranslation();
	const [randomPlaceholder, setRandomPlaceholder] = useState<TReturnType>();

	const tOptionsMemoized = useMemoCompare(tOptions, isEqual);

	const placeholders = useMemo<OneOrMany<TReturnType>>(
		() =>
			/* i18next-extract-disable-next-line */
			t(translationKey, {
				returnObjects: true,
				...tOptionsMemoized
			}),
		[t, tOptionsMemoized, translationKey]
	);

	const updateRandomPlaceholderDebounced = useMemo(
		() =>
			debounce(
				($placeholders: OneOrMany<TReturnType>) => {
					const result = $placeholders instanceof Array ? sample($placeholders) : $placeholders;
					setRandomPlaceholder(result);
				},
				RANDOM_PLACEHOLDER_TIMEOUT,
				{ leading: false, trailing: true }
			),
		[]
	);

	useEffect(() => {
		updateRandomPlaceholderDebounced(placeholders);

		return () => {
			updateRandomPlaceholderDebounced.cancel();
		};
	}, [placeholders, updateRandomPlaceholderDebounced]);

	const updateRandomPlaceholder = useCallback(() => {
		updateRandomPlaceholderDebounced(placeholders);
	}, [placeholders, updateRandomPlaceholderDebounced]);

	return [randomPlaceholder, updateRandomPlaceholder];
};
