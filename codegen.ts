/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	overwrite: true,
	// The upstream schema (carbonio-tasks-ce) is currently not loadable by codegen: it references
	// an undeclared `BigInteger` scalar. Until that is fixed upstream, generate from the committed
	// schema snapshot. To re-sync with the backend, restore the remote URL below:
	// 'https://raw.githubusercontent.com/zextras/carbonio-tasks-ce/devel/app/docs/schema.graphql'
	schema: 'src/gql/schema.graphql',
	// Operations are written inline via the generated `graphql()` function; scan the source for them
	// (the generated output folder and test files are excluded).
	documents: ['src/**/*.{ts,tsx}', '!src/gql/**/*', '!src/**/*.test.{ts,tsx}'],
	generates: {
		'src/gql/': {
			preset: 'client',
			presetConfig: {
				// Fragment masking off: operation results stay "flat" and fields are directly accessible,
				// matching how the app consumes query/fragment data today.
				fragmentMasking: false
			},
			config: {
				// Real native TS enums (the app reads enum members at runtime, e.g. `Status.Open`).
				// v6 defaults enums to `string-literal` (union), so this must be set explicitly.
				enumType: 'native',
				scalars: {
					DateTime: 'number',
					// Match how IDs are used across the app (v6 would otherwise emit `string | number`).
					ID: { input: 'string', output: 'string' }
				},
				useTypeImports: true
			}
		}
	},
	hooks: {
		afterAllFileWrite:
			'eslint --fix --resolve-plugins-relative-to node_modules/@zextras/carbonio-ui-configs'
	}
};

export default config;
