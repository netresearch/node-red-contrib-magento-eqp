import tseslint from "typescript-eslint";
import html from "eslint-plugin-html";

export default tseslint.config(
	{
		ignores: ["dist/", "node_modules/"],
	},
	...tseslint.configs.recommended,
	{
		files: ["src/**/*.html"],
		plugins: { html },
	},
);
