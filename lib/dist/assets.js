// tooling
const fs   = require('../fs');
const path = require('path');

module.exports = ({ from, to }) => (
	// promise source directory files
	fs.readdir(from)
).then(
	// promise all copied files
	(files) => Promise.all(
		files.map(
			(file) => fs.copyFile(path.join(from, file), path.join(to, file))
		)
	).then(
		// do not return promises
		() => {}
	),
	(error) => {
		// if assets directory is not missing
		if (error.code !== 'ENOENT') {
			// throw error
			throw error;
		}
	}
);
