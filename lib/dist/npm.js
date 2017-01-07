// tooling
const child_process = require('../child_process');
const path = require('path');

// promise executed command
module.exports = ({ from }) => child_process('npm install', {
	cwd: path.dirname(from)
});
