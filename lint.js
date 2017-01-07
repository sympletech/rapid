// tooling
const log  = require('./lib/log');
const path = require('path');
const size = require('./lib/size');

// messaging
const msgUpdating = 'is being linted...';
const msgUpdated  = 'has been linted.';
const msgFailure  = 'had an issue linting.';

module.exports = (config = require('./lib/config')) => Promise.resolve(
	['css', 'js'].filter(
		(opt) => opt in config
	).reduce(
		(resolve, opt) => resolve.then(
			// report initialization and distribute
			() => log.wait(`${ opt } ${ path.basename(config[opt].from) } ${ msgUpdating }`) && require(`./lib/lint/${ opt }`)(config, config[opt])
		).then(
			// gzip filesize of output
			size
		).then(
			// report completion and filesizes or errors
			(filesize) => log.pass(config.name, `${ path.basename(config[opt].from) } ${ msgUpdated }`, filesize),
			(error)    => log.fail(config.name, `${ path.basename(config[opt].from) } ${ msgFailure }`, error)
		),
		Promise.resolve()
	)
);
