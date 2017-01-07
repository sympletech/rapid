// tooling
const log  = require('./lib/log');
const path = require('path');
const size = require('./lib/size');

// messaging
const msgUpdating = 'is being updated...';
const msgUpdated  = 'has been updated.';
const msgFailure  = 'had an issue updating.';

// distribute project
module.exports = (config = require('./lib/config')) => {
	return Promise.resolve(
		Object.keys(config.defaults).filter(
			(opt) => config[opt]
		).reduce(
			(resolve, opt) => resolve.then(
				// report initialization and distribute
				() => log.wait(`${ opt } ${ path.basename(config[opt].from || `index.${ opt }`) } ${ msgUpdating }`) && require(`./lib/dist/${ opt }`)(config[opt], config)
			).then(
				// gzip filesize of output
				size
			).then(
				// report completion and filesizes or errors
				(filesize) => log.pass(config.name, `${ path.basename(config[opt].from || `index.${ opt }`) } ${ msgUpdated }`, filesize),
				(error)    => log.fail(config.name, `${ path.basename(config[opt].from || `index.${ opt }`) } ${ msgFailure }`, error)
			),
			Promise.resolve()
		)
	);
};
