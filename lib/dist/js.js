// tooling
const fs     = require('../fs');
const path   = require('path');
const rollup = require('rollup');

// cache
let cache;

module.exports = ({ from, to, map = false, plugins = [], format = 'iife', name = '' }) => (
	// promise processed file
	rollup.rollup({
		cache: cache,
		entry: from,
		plugins: plugins,
		onwarn: () => undefined
	})
).then(
	(bundle) => {
		// generated result
		const result = bundle.generate({
			format: format,
			moduleName: name,
			sourceMap: Boolean(map),
			sourceMapFile: map
		});

		// sourcemap annotation
		const sourcemapAnnotation = map && map !== true ? `//# sourceMappingURL=${ path.relative(path.dirname(to), map) }` : '';

		// promise written compiled files
		return (
			typeof map === 'string'
			? Promise.all([
				fs.writeFile(to,  String(result.code) + sourcemapAnnotation),
				fs.writeFile(map, String(result.map))
			])
			: fs.writeFile(to, String(result.code))
		).then(
			// promise contents
			() => String(result.code + sourcemapAnnotation)
		);
	}
);
