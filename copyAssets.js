const FS = require('fs');

if (!FS.existsSync('dist')) {
	FS.mkdirSync('dist');
}

FS.readdirSync('src')
	.filter((f) => f.endsWith('.html'))
	.forEach((f) => FS.copyFileSync('src/' + f, 'dist/' + f));
