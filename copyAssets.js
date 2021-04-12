const Path = require('path');
const FS = require('fs');

const SRC_FOLDER = Path.join(__dirname, 'src');
const DIST_FOLDER = Path.join(__dirname, 'dist');

if (!FS.existsSync(DIST_FOLDER)) {
	FS.mkdirSync(DIST_FOLDER);
}

FS.readdirSync(SRC_FOLDER)
	.filter((f) => f.endsWith('.html'))
	.forEach((f) => FS.copyFileSync(Path.join(SRC_FOLDER, f), Path.join(DIST_FOLDER, f)));
