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
	secondaryAction: () => void;
	showSecondaryAction: boolean;
	secondaryLabel: string;
	secondaryIcon: string;
}

export const ReminderModalFooter = ({
	closeAction,
	secondaryAction,
	showSecondaryAction,
	secondaryLabel,
	secondaryIcon
}: ReminderModalFooterProps): React.JSX.Element => {
	const [t] = useTranslation();

	return (
		<Row gap={'0.5rem'}>
			{showSecondaryAction && (
				<Button
					type={'outlined'}
					label={secondaryLabel}
					icon={secondaryIcon}
					onClick={secondaryAction}
				/>
			)}
			<Button label={t('modal.reminder.dismiss', 'Dismiss')} onClick={closeAction} />
		</Row>
	);
};
