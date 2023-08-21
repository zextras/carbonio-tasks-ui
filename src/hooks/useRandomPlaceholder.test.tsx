/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, screen } from '@testing-library/react';
import { without } from 'lodash';

import { useRandomPlaceholder } from './useRandomPlaceholder';
import { setup } from '../utils/testUtils';

describe('Use random placeholder', () => {
	const TestRandomPlaceholder = <TValue,>({ value }: { value: TValue }): JSX.Element => {
		// use a state to force rerender
		const [randomPlaceholder, updateRandomPlaceholder] = useRandomPlaceholder('translation.key', {
			defaultValue: value
		});

		return (
			<>
				<div>{String(randomPlaceholder)}</div>
				<button onClick={updateRandomPlaceholder}>Update</button>
			</>
		);
	};

	test('Return always the same placeholder if only one is provided', async () => {
		const value = faker.word.words();
		const { user } = setup(<TestRandomPlaceholder value={value} />);
		expect(screen.queryByText(value)).not.toBeInTheDocument();
		await screen.findByText(value);
		expect(screen.getByText(value)).toBeVisible();
		await user.click(screen.getByRole('button'));
		act(() => {
			jest.advanceTimersToNextTimer();
		});
		expect(screen.getByText(value)).toBeVisible();
	});

	test('Return a random placeholder on update', async () => {
		// create a big array so that the probability of having a different value on second run is high
		const values = Array.from(Array(100), () => faker.word.words(3));
		const firstValueRegexp = RegExp(values.join('|'));
		const { user } = setup(<TestRandomPlaceholder value={values} />);

		await screen.findByText(firstValueRegexp);
		const valueElement = screen.getByText(firstValueRegexp);
		expect(valueElement).toBeVisible();
		const firstValue = valueElement.textContent as string;
		const secondUpdateValues = without(values, firstValue);
		const secondValueRegexp = RegExp(secondUpdateValues.join('|'));
		await user.click(screen.getByRole('button'));
		act(() => {
			jest.advanceTimersToNextTimer();
		});
		const secondValueElement = await screen.findByText(secondValueRegexp);
		const secondValue = secondValueElement.textContent as string;
		expect(screen.queryByText(firstValue)).not.toBeInTheDocument();
		expect(screen.getByText(secondValue)).toBeVisible();
		expect(secondUpdateValues).toContain(secondValue);
		const thirdUpdateValues = without(secondUpdateValues, secondValue);
		const thirdValueRegexp = RegExp(thirdUpdateValues.join('|'));
		await user.click(screen.getByRole('button'));
		act(() => {
			jest.advanceTimersToNextTimer();
		});
		const thirdValueElement = await screen.findByText(thirdValueRegexp);
		const thirdValue = thirdValueElement.textContent as string;
		expect(screen.queryByText(firstValue)).not.toBeInTheDocument();
		expect(screen.getByText(thirdValue)).toBeVisible();
		expect(thirdUpdateValues).toContain(thirdValue);
	});

	test('Update placeholder if values change', async () => {
		// create a big array so that the probability of having a different value on second run is high
		const values = Array.from(Array(100), () => faker.word.words(3));
		const valuesPlusOne = [...values, faker.word.words(3)];
		const oneOfValues = RegExp(values.join('|'));
		const { rerender } = setup(<TestRandomPlaceholder value={values} />);
		const valueElement = await screen.findByText(oneOfValues);
		const value = valueElement.textContent as string;
		const anotherOfValues = RegExp(without(valuesPlusOne, value).join('|'));
		expect(screen.getByText(value)).toBeVisible();
		rerender(<TestRandomPlaceholder value={valuesPlusOne} />);
		await screen.findByText(anotherOfValues);
		expect(screen.queryByText(value)).not.toBeInTheDocument();
	});

	test('Does not update placeholder on rerender with the same values, even if the instance change', async () => {
		// create a big array so that the probability of having a different value on second run is high
		const values = Array.from(Array(100), () => faker.word.words(3));
		const oneOfValues = RegExp(values.join('|'));
		const { rerender } = setup(<TestRandomPlaceholder value={values} />);
		const valueElement = await screen.findByText(oneOfValues);
		const value = valueElement.textContent as string;
		expect(screen.getByText(value)).toBeVisible();
		// rerender with a new instance which contains the same data
		rerender(<TestRandomPlaceholder value={[...values]} />);
		act(() => {
			jest.advanceTimersToNextTimer();
		});
		await screen.findByText(oneOfValues);
		expect(screen.getByText(value)).toBeVisible();
	});

	test('Return an object if the translation is an object', async () => {
		const toStringResult = 'print object';
		const value = {
			title: faker.word.words(),
			message: faker.lorem.sentence(),
			toString(): string {
				return toStringResult;
			}
		};
		setup(<TestRandomPlaceholder value={value} />);
		expect(screen.queryByText(value.title)).not.toBeInTheDocument();
		expect(screen.queryByText(value.message)).not.toBeInTheDocument();
		expect(screen.queryByText(toStringResult)).not.toBeInTheDocument();
		await screen.findByText(toStringResult);
		expect(screen.getByText(toStringResult)).toBeVisible();
		expect(screen.queryByText(value.title)).not.toBeInTheDocument();
		expect(screen.queryByText(value.message)).not.toBeInTheDocument();
	});
});
