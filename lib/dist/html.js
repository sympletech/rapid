// tooling
const eslit = require('eslit');
const fs    = require('../fs');
const path  = require('path');

// configure eslit to use jsx
eslit.extension = '.jsx';

module.exports = ({ from, to, rawcontext, before = '', after = '' }) => Promise.resolve(
	rawcontext || `${ from.replace(/\.jsx$/, '') }.json`
).then(
	// promise captured context
	(context) => typeof context === 'string'
	? fs.readFile(context, 'utf8').then(
		// promise parsed source context or an empty object
		(content) => JSON.parse(content),
		() => ({})
	)
	: Promise.resolve(context)
).then(
	// promise compiled source with context
	(context) => eslit.import(from, context)
).then(
	// promise written compiled source
	(content) => `${ Array.isArray(before) ? before.join('') : before }${ content }${ Array.isArray(after) ? after.join('') : after }`
).then(
	(content) => fs.writeFile(to, content).then(
		// promise content
		() => `${ Array.isArray(before) ? before.join('') : before }${ content }${ Array.isArray(after) ? after.join('') : after }`
	)
);
