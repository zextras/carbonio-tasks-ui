/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionItemType, Container } from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';

const SecondaryBarView = (props: { expanded: boolean }): JSX.Element => {
	const [t] = useTranslation();
	const { name } = useUserAccount();

	const items = useMemo<AccordionItemType[]>(
		() => [
			{
				id: 'id1',
				label: name,
				icon: 'HomeOutline',
				open: true,
				items: [
					{
						id: 'id2',
						icon: 'ListViewOutline',
						label: t('secondaryBar.allTasks', 'All Tasks'),
						onClick: (ev): void => {
							ev.stopPropagation();
						},
						active: true
					}
				],
				onClick: (ev: React.SyntheticEvent | KeyboardEvent): void => {
					ev.stopPropagation();
				}
			}
		],
		[name, t]
	);

	return (
		<Container
			height="auto"
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
		>
			<Accordion role="menuitem" items={items} />
		</Container>
	);
};
export default SecondaryBarView;
