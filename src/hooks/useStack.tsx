/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	type Dispatch,
	type Reducer,
	type ReducerAction,
	type ReducerState,
	useReducer
} from 'react';

export const STACK_ACTION = {
	ADD: 'ADD',
	REMOVE: 'REMOVE',
	REPLACE: 'REPLACE'
} as const;
type StackAction<T> =
	| { type: typeof STACK_ACTION.ADD | typeof STACK_ACTION.REPLACE; value: T }
	| { type: typeof STACK_ACTION.REMOVE };

function stackReducer<T>(state: T[], action: StackAction<T>): T[] {
	const newState = [...state];
	switch (action.type) {
		case STACK_ACTION.ADD:
			newState.push(action.value);
			return newState;
		case STACK_ACTION.REMOVE:
			newState.splice(-1, 1);
			return newState;
		case STACK_ACTION.REPLACE:
			newState.splice(-1, 1, action.value);
			return newState;
		default:
			return state;
	}
}

type StackReducer<T> = Reducer<T[], StackAction<T>>;

export const useStack = <T,>(): [
	ReducerState<StackReducer<T>>,
	Dispatch<ReducerAction<StackReducer<T>>>
] => useReducer<StackReducer<T>>(stackReducer, []);
