// tooling
const child = require('../child_process');

// promise executed command
module.exports = (configOpts, { from }) => child('npm install --only=production', {
	cwd: from
});
