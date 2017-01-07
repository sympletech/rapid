// tooling
const fs      = require('../fs');
const path    = require('path');
const postcss = require('postcss');

module.exports = ({ from, to, map = false, plugins = [], syntax }) => (
	// promise read source
	fs.readFile(from, 'utf8')
).then(
	// promise processed source
	(contents) => postcss(plugins).process(
		contents,
		// processor options
		Object.assign({
			from: from,
			to:   to,
			map: typeof map === 'string' ? {
				inline: false
			} : Boolean(map)
		},
		syntax ? {
			syntax: syntax
		} : {})
	)
).then(
	// promise written compiled files
	(result) => (
		typeof map === 'string'
		? Promise.all([
			fs.writeFile(to,  String(result.css)),
			fs.writeFile(map, String(result.map))
		])
		: fs.writeFile(to, String(result.css))
	).then(
		// promise contents
		() => String(result.css)
	)
);
