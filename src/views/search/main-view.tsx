/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Text } from '@zextras/carbonio-design-system';

const MainSearchView = (): JSX.Element => {
	const [t] = useTranslation();
	return (
		<Container>
			<Text>{t('label.view', 'This is a view')}</Text>
		</Container>
	);
};
export default MainSearchView;
