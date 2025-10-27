/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApolloClient } from '@apollo/client';
import graphql from '@rollup/plugin-graphql';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [graphql()],
	define: {
		BASE_PATH: JSON.stringify('/')
	},
	test: {
		// Test environment
		environment: 'jsdom',

		// Setup files
		setupFiles: ['./src/vitest-polyfills.ts', './src/vitest-setup-mocks.ts', './src/vitest-env-setup.ts'],

		// Coverage configuration
		coverage: {
			provider: 'v8',
			reporter: ['text', 'cobertura', 'lcov'],
			include: ['src/**/*.{js,ts,jsx,tsx}'],
			exclude: [
				'**/node_modules/**',
				'src/tests/**',
				'src/mocks/**',
				'src/types/**',
				'**/(test|mock)*.ts?(x)'
			],
			thresholds: {
				branches: 75,
				functions: 75,
				lines: 75,
				statements: 75
			}
		},

		// Global variables
		globals: true,

		// Timeout
		testTimeout: 60000,

		// Test file patterns
		include: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
		exclude: ['**/node_modules/**', '**/constants/test.ts'],

		// Mock settings
		restoreMocks: true,

		// Retry configuration
		retry: 2
	},
	resolve: {
		alias: {
			'react-pdf/dist/esm/entry.webpack': 'react-pdf',
			// Stub asset imports
			'\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
				'./src/mocks/fileMock.ts'
		}
	}
});
