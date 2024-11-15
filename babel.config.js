/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
module.exports = (api) => {
	let presetEnv;
	if (api.env('test')) {
		presetEnv = '@babel/preset-env';
	} else {
		presetEnv = ['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3.32 }];
	}
	return {
		presets: [presetEnv, '@babel/preset-react', '@babel/preset-typescript'],
		plugins: ['babel-plugin-styled-components']
	};
};
