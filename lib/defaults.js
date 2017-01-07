module.exports = {
	html: {
		from: 'index.jsx',
		to: 'dist/index.html',
		data: 'index.json',
		before: [
			'<!doctype html>',
			'<meta charset="utf-8">',
			'<meta name="viewport" content="width=device-width,initial-scale=1">',
			'<meta http-equiv="X-UA-Compatible" content="IE=edge">',
			'<script src="index.js"></script>',
			'<link href="index.css" rel="stylesheet">'
		].join(''),
		after: '',
		watch: /\.jsx$|index\.json$/
	},
	css: {
		from:  'index.css',
		to:    'dist/index.css',
		map:   'dist/index.css.map',
		lint:  '**.css',
		watch: /\.css$/
	},
	js: {
		from:  'index.js',
		to:    'dist/index.js',
		map:   'dist/index.js.map',
		lint:  '**.js',
		watch: /\.js$/
	},
	assets: {
		from:  'assets',
		to:    'dist/assets',
		watch: /^assets/
	}
};
