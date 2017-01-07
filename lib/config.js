// current working directory
const cwd = process.cwd();
const path = require('path');

// initialized config
const config = {
	defaults: require('./defaults'),
	from: cwd,
	name: 'project',
	ignore: [],
	rate: 1000 / 30
};

// assign defaults
Object.keys(config.defaults).forEach(
	(key) => {
		config[key] = Object.assign({}, config.defaults[key]);
	}
);

// local package.json
try {
	// local package
	const pkg = require(
		path.join(cwd, 'package.json')
	);

	// rapid config
	const cfg = pkg.rapidConfig || {};

	// assign name
	if (typeof pkg.name === 'string' && !cfg.name) {
		cfg.name = pkg.name;
	}

	// assign html context config
	if (typeof pkg.context === 'string' && (!cfg.html || !cfg.html.data)) {
		cfg.html = cfg.html || {};
		cfg.html.data = pkg.context;
	}

	// assign html template config
	if (typeof pkg.template === 'string' && (!cfg.html || !cfg.html.from)) {
		cfg.html = cfg.html || {};
		cfg.html.from = pkg.template;
	}

	// assign js config
	if (typeof pkg.main === 'string' && (!cfg.js || !cfg.js.from)) {
		cfg.js = cfg.js || {};
		cfg.js.from = pkg.main;
	}

	// assign css config
	if (typeof pkg.style === 'string' && (!cfg.css || !cfg.css.from)) {
		cfg.css = cfg.css || {};
		cfg.css.from = pkg.style;
	}

	// assign rapid config name
	config.name = cfg.name;

	// assign rapid config from default keys
	Object.keys(config.defaults).forEach(
		(key) => {
			Object.assign(config[key], cfg[key]);
		}
	);
} catch (error) {
	// continue regardless of error
}

// assign local config
try {
	Object.assign(
		config,
		require(
			path.join(cwd, '.config')
		)
	);
} catch (error) {
	// continue regardless of error
}

// assign stringified css plugins
if (Array.isArray(config.css.plugins)) {
	config.css.plugins = config.css.plugins.map(
		(plugin) => typeof plugin === 'string' ? require(plugin) : Array.isArray(plugin) ? require(plugin[0])(plugin[1]) : plugin
	);
}

// assign stringified js plugins
if (Array.isArray(config.js.plugins)) {
	config.js.plugins = config.js.plugins.map(
		(plugin) => typeof plugin === 'string' ? require(plugin) : Array.isArray(plugin) ? require(plugin[0])(plugin[1]) : plugin
	);
}

module.exports = config;
