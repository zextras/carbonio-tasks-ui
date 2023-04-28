/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import {
	type CreateSnackbarFn,
	Snackbar,
	SnackbarManagerContext,
	type SnackbarManagerProps
} from '@zextras/carbonio-design-system';
import { last } from 'lodash';

import { STACK_ACTION, useStack } from '../hooks/useStack';

export const SnackbarStackManager = ({
	autoHideDefaultTimeout,
	children
}: SnackbarManagerProps): JSX.Element => {
	const [stack, updateStack] = useStack<JSX.Element>();

	const createSnackbar = useCallback<CreateSnackbarFn>(
		({ key, onActionClick, onClose, replace, ...rest }) => {
			const handleClose = (): void => {
				onClose && onClose();
				updateStack({ type: STACK_ACTION.REMOVE });
			};
			const handleActionClick = (): void => {
				onActionClick ? onActionClick() : onClose && onClose();
				updateStack({ type: STACK_ACTION.REMOVE });
			};

			const SnackbarComponent = (
				<Snackbar
					key={key || `snackbar-${Date.now()}`}
					open
					onActionClick={handleActionClick}
					onClose={handleClose}
					autoHideTimeout={autoHideDefaultTimeout}
					{...rest}
				/>
			);

			updateStack({
				type: replace ? STACK_ACTION.REPLACE : STACK_ACTION.ADD,
				value: SnackbarComponent
			});
		},
		[autoHideDefaultTimeout, updateStack]
	);

	return (
		<>
			<SnackbarManagerContext.Provider value={createSnackbar}>
				{children}
			</SnackbarManagerContext.Provider>
			{last(stack)}
		</>
	);
};
