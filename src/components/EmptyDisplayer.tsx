/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';

import { Container, Padding } from '@zextras/carbonio-design-system';
import { sample, debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CenteredText } from './StyledComponents';
import { ListContext } from '../contexts';
import { OneOrMany } from '../types/utils';

interface EmptyDisplayerProps {
	translationKey: string;
}

export const EmptyDisplayer: React.VFC<EmptyDisplayerProps> = ({ translationKey }) => {
	const [t] = useTranslation();
	const { isFull } = useContext(ListContext);
	const [randomPlaceholder, setRandomPlaceholder] = useState<{ title: string; message?: string }>();

	const placeholders = useMemo<OneOrMany<{ title: string; message?: string }>>(
		() =>
			/* i18next-extract-disable-next-line */
			t(translationKey, {
				context: (isFull && 'limitReached') || '',
				returnObjects: true
			}),
		[isFull, t, translationKey]
	);

	const updatePlaceholder = useMemo(
		() =>
			debounce(
				($placeholders: OneOrMany<{ title: string; message?: string }>) => {
					const result =
						$placeholders instanceof Array
							? (sample($placeholders) as { title: string; message?: string })
							: $placeholders;
					setRandomPlaceholder(result);
				},
				250,
				{ leading: false, trailing: true }
			),
		[]
	);

	useEffect(() => {
		updatePlaceholder(placeholders);

		return (): void => {
			updatePlaceholder.cancel();
		};
	}, [placeholders, updatePlaceholder]);

	return (
		<Container>
			<Padding all="medium">
				<CenteredText color="gray1" overflow="break-word" weight="bold" size="large">
					{randomPlaceholder?.title || ''}
				</CenteredText>
			</Padding>
			<CenteredText size="small" color="gray1" overflow="break-word" $width="60%">
				{randomPlaceholder?.message || ''}
			</CenteredText>
		</Container>
	);
};
