// tooling
const path = require('path');

// css linting
module.exports = ({
	from = process.cwd()
} = {}, {
	dir   = 'src',
	syntax = 'scss'
} = {}) => require('stylelint').lint({
	configBasedir: path.resolve(from),
	files:         path.join(dir, `{*.css,*.${ syntax }}`),
	syntax:        syntax
}).then(
	// promise formatted results
	(results) => {
		if (results.errored) {
			// reject with formatted errors
			throw results.results.map(
				(result) => ({
					filename: path.relative(path.dirname(from), result.source),
					messages: result.warnings.map(
						(warning) => ({
							line:    warning.line,
							column:  warning.column,
							message: warning.text.replace(/\s*\(.+?\)$/, ''),
							id:      warning.rule
						})
					)
				})
			);
		}
	},
	(error) => {
		// ignore configuration errors regarding no configuration
		if (!(/^No configuration/).test(error.message)) {
			throw error;
		}
	}
);
