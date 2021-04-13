const TS = require('typescript');
const Path = require('path');
const FS = require('fs');
const tsConfig = require('./tsconfig.json');

const SRC_FOLDER = Path.join(__dirname, 'src');
const DIST_FOLDER = Path.join(__dirname, 'dist');
const ICON_FOLDER = Path.join(__dirname, 'icons');
const DIST_ICON_FOLDER = Path.join(__dirname, 'dist', 'icons');

if (FS.existsSync(DIST_FOLDER)) {
	console.log('Deleting dist folder...');

	FS.rmSync(DIST_FOLDER, { force: true, recursive: true });
}

FS.mkdirSync(DIST_FOLDER);
FS.mkdirSync(DIST_ICON_FOLDER);

const sourceFiles = FS.readdirSync(SRC_FOLDER);
const iconsFiles = FS.readdirSync(ICON_FOLDER);

const tsFiles = sourceFiles.filter((f) => f.endsWith('.ts'));
const htmlFiles = sourceFiles.filter((f) => f.endsWith('.html'));
const iconFiles = iconsFiles.filter((f) => f.endsWith('.png') || f.endsWith('.svg'));

tsFiles.forEach((f) => {
	const splitFileName = f.split('.');
	splitFileName.pop();

	const fileName = splitFileName.join('.');

	const inputFile = Path.join(SRC_FOLDER, f);
	const outputPath = Path.join(DIST_FOLDER, `${fileName}.js`);

	console.log(`[Backend] Compiling "${inputFile}" to ${outputPath}...`);

	const output = TS.transpile(FS.readFileSync(inputFile, 'utf-8'), tsConfig);

	FS.writeFileSync(outputPath, output);
});

htmlFiles.forEach((f) => {
	console.log(`[Frontend] "${f}"...`);

	FS.copyFileSync(Path.join(SRC_FOLDER, f), Path.join(DIST_FOLDER, f));
});

iconFiles.forEach((f) => {
	console.log(`[Icons] Copying "${f}"...`);

	FS.copyFileSync(Path.join(ICON_FOLDER, f), Path.join(DIST_ICON_FOLDER, f));
});
