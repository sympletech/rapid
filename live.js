// tooling
const debounce = require('./lib/debounce');
const fs       = require('./lib/fs');
const log      = require('./lib/log');
const matcher  = require('minimatch');
const path     = require('path');
const size     = require('./lib/size');

// messaging
const msgUpdating = 'is being updated...';
const msgUpdated  = 'has been updated.';
const msgFailure  = 'had an issue updating.';
const msgStart    = 'is listening for changes...';
const msgStop     = 'has finished listening.';

// proxied modules on demand
const proxy = (lib) => {
	proxy[lib] = proxy[lib] || require(lib);

	return proxy[lib];
};

// cached promise resolver
let resolve = Promise.resolve();

// watch for file changes
module.exports = (config = require('./lib/config')) => {
	// specific configurations
	const {
		from,
		ignore,
		name,
		rate
	} = config;

	const ignoreList = ['node_modules/**', 'dist/**'].concat(ignore);

	// start report
	log.pend(name, msgStart);

	// watch module directory
	const watch = fs.watch(
		from,
		{
			persistent: true,
			recursive: true
		},
		debounce(
			(event, file) => !ignoreList.some(
				(pattern) => matcher(file, pattern)
			) && Object.keys(config.defaults).filter(
				// each kind of config
				(opt) => opt in config && config[opt].watch instanceof RegExp && config[opt].watch.test(file)
			).forEach(
				// distribute with each config
				(opt) => {
					// update with config
					resolve = resolve.then(
						// report update and distribute
						() => log.wait(name, `${ opt } ${ file } ${ msgUpdating }`) && proxy('./lib/dist/' + opt)(config[opt])
					).then(
						// gzip filesize of output
						size
					).then(
						// report completion and filesizes or errors
						(filesize) => log.pass(name, `${ file } ${ msgUpdated }`, filesize),
						(error)    => log.fail(name, `${ file } ${ msgFailure }`, error)
					).then(
						// re-initialize message
						() => log.pend(name, msgStart)
					);
				}
			),
			rate
		)
	);

	// allow exit with `CTRL+C` or `q`
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.setEncoding('utf8');

	// on key presses
	process.stdin.on('data', (chunk) => {
		// if `CTRL+C` or `q` is pressed
		if (chunk === 'q' || chunk === '\u0003') {
			// stop watch
			watch.close();

			// stop report
			log.stop().pass(name, msgStop).line();

			// exit process
			process.exit(0);
		}
	});
};
