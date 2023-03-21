/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Button, Row } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

interface ReminderModalFooterProps {
	closeAction: () => void;
	completeAllAction: () => void;
}

export const ReminderModalFooter = ({
	closeAction,
	completeAllAction
}: ReminderModalFooterProps): JSX.Element => {
	const [t] = useTranslation();

	return (
		<Row gap={'0.5rem'}>
			<Button
				type={'outlined'}
				label={t('modal.reminder.completeAll', 'Complete all')}
				icon={'CheckmarkCircleOutline'}
				onClick={completeAllAction}
			/>
			<Button label={t('modal.reminder.dismiss', 'Dismiss')} onClick={closeAction} />
		</Row>
	);
};
