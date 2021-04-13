const TS = require('typescript');
const Path = require('path');
const FS = require('fs');
const tsConfig = require('./tsconfig.json');

const SRC_FOLDER = Path.join(__dirname, 'src');
const DIST_FOLDER = Path.join(__dirname, 'dist');

if (FS.existsSync(DIST_FOLDER)) {
	console.log('Deleting dist folder...');

	FS.rmSync(DIST_FOLDER, { force: true, recursive: true });
}

FS.mkdirSync(DIST_FOLDER);

const sourceFiles = FS.readdirSync(SRC_FOLDER);

const tsFiles = sourceFiles.filter((f) => f.endsWith('.ts'));
const htmlFiles = sourceFiles.filter((f) => f.endsWith('.html'));

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
