const config = {
	name: 'testing',
	from: 'test/src',
	to: 'test/dist',
	npm: {
		from:  'test/src/package.json'
	},
	html: {
		from:  'test/src/index.jsx',
		to:    'test/dist/index.html',
		data:  'test/src/index.json',
		watch: /\.jsx$|index\.json$/
	},
	css: {
		dir:   'test/src',
		from:  'test/src/index.css',
		to:    'test/dist/index.css',
		map:   'test/dist/index.css.map',
		watch: /\.css$/
	},
	js: {
		dir:   'test/src',
		from:  'test/src/index.js',
		to:    'test/dist/index.js',
		map:   'test/dist/index.js.map',
		watch: /\.js$/
	},
	assets: {
		from:  'test/src/assets',
		to:    'test/dist/assets',
		watch: /^assets$/
	},
	defaults: {
		html: {},
		css: {},
		js: {},
		assets: {}
	}
};

require('..').dist(config).then(
	() => require('..').lint(config)
);
