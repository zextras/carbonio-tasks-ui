/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
module.exports = (api) => {
	// You can use isTest to determine what presets and plugins to use.
	const isTest = api.env('test');

	const config = {
		presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
		plugins: ['@babel/plugin-transform-runtime', 'babel-plugin-styled-components']
	};

	if (!isTest) {
		config.plugins.push([
			'i18next-extract',
			{
				outputPath: 'translations/{{ns}}.json',
				defaultNS: 'en',
				jsonSpace: 4,
				defaultContexts: []
			}
		]);
	}

	return config;
};
