/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
module.exports = {
	extends: ['./node_modules/@zextras/carbonio-ui-configs/rules/eslint.js'],
	plugins: ['notice', 'unused-imports'],
	rules: {
		'notice/notice': [
			'error',
			{
				templateFile: './notice.template.js'
			}
		],
		'import/no-extraneous-dependencies': 'off',
		'import/order': [
			'error',
			{
				groups: [['builtin', 'external']],
				pathGroups: [
					{
						pattern: 'react',
						group: 'external',
						position: 'before'
					}
				],
				pathGroupsExcludedImportTypes: ['react'],
				'newlines-between': 'always',
				alphabetize: {
					order: 'asc',
					caseInsensitive: true
				}
			}
		],
		'@typescript-eslint/no-unused-vars': 'off',
		'unused-imports/no-unused-imports': 'error',
		'unused-imports/no-unused-vars': [
			'warn',
			{ vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }
		],
		'no-shadow': 'off',
		'@typescript-eslint/no-shadow': ['error'],
		'no-console': ['warn', { allow: ['error'] }],
		'no-duplicate-imports': ['error', { includeExports: true }],
		'@typescript-eslint/consistent-type-imports': [
			'error',
			{
				fixStyle: 'inline-type-imports'
			}
		],
		'max-len': 'warn'
	},
	overrides: [
		{
			// enable eslint-plugin-testing-library rules or preset only for test files
			files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
			extends: ['plugin:jest-dom/recommended', 'plugin:testing-library/react'],
			rules: {
				'jest-dom/prefer-enabled-disabled': 'off',
				'testing-library/no-unnecessary-act': 'warn',
				'testing-library/no-global-regexp-flag-in-query': 'error',
				'testing-library/prefer-user-event': 'warn',
				'import/no-extraneous-dependencies': 'off'
			}
		},
		{
			files: ['*.[jt]s(x)?'],
			processor: '@graphql-eslint/graphql',
			extends: ['plugin:prettier/recommended']
		},
		{
			files: ['*.graphql'],
			parser: '@graphql-eslint/eslint-plugin',
			plugins: ['@graphql-eslint'],
			rules: {
				'prettier/prettier': 'error',
				'@graphql-eslint/known-type-names': 'error',
				'notice/notice': 'off'
			},
			parserOptions: {
				operations: './src/gql/**/*.graphql',
				schema: './src/gql/schema.graphql'
			}
		}
	]
};
