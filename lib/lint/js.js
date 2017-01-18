// tooling
const fs = require('../fs');
const JSCS = require('jscs');
const path = require('path');

const {
	CLIEngine
} = require('eslint');

module.exports = ({
	from = process.cwd()
} = {}, {
	dir = 'src'
} = {}) => Promise.all([
	eslintThenified(from, dir),
	jscsThenified(from, dir)
]).then(
	() => {}
);

const eslintThenified = (from, dir) => new Promise(
	(resolve, reject) => {
		// eslint linter
		const cli = new CLIEngine({
			cwd: path.resolve(dir),
			envs: ['browser']
		});

		// synchronously run linting on all JS files
		const report = cli.executeOnFiles([
			'./'
		]);

		if (report.errorCount) {
			// reject with formatted errors
			reject(report.results.filter(
				(result) => result.messages.length
			).map(
				(result) => ({
					filename: path.relative(path.resolve(from), result.filePath),
					messages: result.messages.map(
						(message) => ({
							line:    message.line,
							column:  message.column,
							message: message.message,
							id:      message.ruleId
						})
					)
				})
			));
		} else {
			resolve();
		}
	}
);

const jscsThenified = (from, dir) => {
	const pkg = path.resolve(from, 'package.json');

	const pathConfig = {
		configPath: pkg
	};

	return fs.readFile(pkg, 'utf8').then(
		// get package.json jscsConfig
		(content) => JSON.parse(content).jscsConfig || {}
	).then(
		(pkgConfig) => Object.assign(pkgConfig, pathConfig)
	).catch(
		() => pathConfig
	).then(
		(config) => {
			// jscs linter
			const jscs = new JSCS();

			// configure jscs
			jscs.registerDefaultRules();

			jscs.configure(config);

			// promise JSCS linting of all JS files
			return jscs.checkDirectory(dir).then(
				(results) => {
					const filteredResults = results.filter(
						(result) => result._errorList.length
					);

					if (filteredResults.length) {
						const errorsByFileName = {};

						// for each error
						results.forEach(
							(result) => result._errorList.forEach(
								(error) => {
									const filename = path.relative(from, error.filename);

									// group errors by filename
									errorsByFileName[filename] = errorsByFileName[filename] || {
										filename: filename,
										messages: []
									};

									// add errors to error by filename
									errorsByFileName[filename].messages.push({
										line:    error.line,
										column:  error.column,
										message: error.message.replace(/\w+?:\s*/, ''),
										id:      error.rule
									});
								}
							)
						);

						// reject with formatted errors
						throw Object.keys(errorsByFileName).filter(
							(filename) => errorsByFileName[filename].messages.length
						).map(
							(filename) => errorsByFileName[filename]
						);
					}
				}
			);
		}
	);
};
