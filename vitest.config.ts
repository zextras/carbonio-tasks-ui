/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

dotenv.config({ path: '.env' });

const retry = process.env.JEST_RETRY_TIMES ? parseInt(process.env.JEST_RETRY_TIMES, 10) : 2;
const isCI = process.env.CI === 'true';

export default defineConfig({
	plugins: [
		react({
			jsxImportSource: '@emotion/react',
			babel: {
				plugins: ['@emotion/babel-plugin']
			}
		})
	],
	test: {
		reporters: isCI ? ['default'] : ['verbose'],
		retry,
		environment: 'jsdom',
		setupFiles: ['./src/setupTests.ts'],
		restoreMocks: true,
		maxWorkers: isCI ? 2 : undefined,
		coverage: {
			enabled: true,
			provider: 'v8',
			reporter: ['lcov', 'cobertura'],
			exclude: ['node_modules/', 'src/setupTests.ts'],
			thresholds: {
				branches: 75,
				functions: 75,
				lines: 75,
				statements: 75
			}
		},
		globals: true,
		testTimeout: 60000
	}
});
