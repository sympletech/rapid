// tooling
const cprocess = require('./lib/child_process');
const log      = require('./lib/log');
const path     = require('path');
const size     = require('./lib/size');

// messaging
const msgUpdating = 'is installing';

// install package
module.exports = (config = require('./lib/config'), ...pkgs) => log.wait(config.name, `${ msgUpdating } ${ pkgs.join(' ') }`) && cprocess(`npm install ${ pkgs.join(' ') }`, {
	cwd: config.from
}).then(
	(result) => log.pass(config.name, result),
	(error)  => log.fail(config.name, error)
);
