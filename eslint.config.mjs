import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import html from 'eslint-plugin-html';

export default tseslint.config(
	{
		ignores: ['dist/', 'node_modules/', 'coverage/']
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	eslintConfigPrettier,
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
		rules: {
			'@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }]
		}
	},
	{
		files: ['src/**/*.html'],
		plugins: { html }
	}
);
