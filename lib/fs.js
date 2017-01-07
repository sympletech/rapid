// tooling
const fs   = require('fs');
const path = require('path');

// fs module then-ified, extendable, and dependency free
Object.assign(
	exports,
	// extend with fs methods
	fs,
	// extend with then-ified fs methods
	...[
		'access',
		'appendFile',
		'chmod',
		'chown',
		'close',
		'exists',
		'fchmod',
		'fchown',
		'fdatasync',
		'fstat',
		'fsync',
		'ftruncate',
		'futimes',
		'lchmod',
		'lchown',
		'link',
		'lstat',
		'mkdtemp',
		'open',
		'read',
		'readdir',
		'readFile',
		'readlink',
		'realpath',
		'rename',
		'rmdir',
		'stat',
		'symlink',
		'truncate',
		'unlink',
		'utimes',
		'write',
		'write'
	].map(
		(name) => ({
			[name]: (...args) => new Promise(
				(resolve, reject) => fs[name](
					...args,
					(error, data) => error ? reject(error) : resolve(data)
				)
			)
		})
	),
	// extend with mkdir-ified fs methods
	...['mkdir', 'writeFile'].map(
		(key) => ({
			[key]: (target, ...args) => new Promise(
				(resolve, reject) => fs[key](
					target,
					...args,
					(error, data) => (
						// if there is no parent directory
						error && error.code === 'ENOENT'
						// resolve with a promise to make the parent directory
						? resolve(
							exports.mkdir(
								path.dirname(target)
							).then(
								// and then try again
								() => exports[key](target, ...args)
							)
						)
						// otherwise
						: (
							// if there is an error not about the directory already existing
							error && error.code !== 'EEXIST'
							// reject with the error
							? reject(error)
							// otherwise, resolve
							: resolve(data)
						)
					)
				)
			)
		})
	),
	// extend with then-ified touchFile
	{
		touchFile: (target) => new Promise(
			(resolve, reject) => fs.open(
				target,
				'wx',
				(error, data) => (
					// if there is no parent directory
					error && error.code === 'ENOENT'
					// resolve with a promise to make the parent directory
					? resolve(
						exports.mkdir(
							path.dirname(target)
						).then(
							// and then try again
							() => exports.touchFile(target)
						)
					)
					// otherwise
					: (
						// if there is an error not about the directory already existing
						error && error.code !== 'EEXIST'
						// reject with the error
						? reject(error)
						// otherwise, resolve
						: resolve(data)
					)
				)
			)
		)
	},
	// extend with then-ified copyFile
	{
		copyFile: (source, target) => exports.mkdir(path.dirname(target)).then(
			() => new Promise(
				(resolve, reject) => {
					const readStream  = exports.createReadStream(source);
					const writeStream = exports.createWriteStream(target);

					readStream.on('error', prereject);

					writeStream.on('error', prereject);
					writeStream.on('finish', resolve);

					readStream.pipe(writeStream);

					function prereject(error) {
						readStream.destroy();
						writeStream.end();

						reject(error);
					}
				}
			)
		)
	}
);
