#!/usr/bin/env node

// rapid
const rapid = require('.');

// desired rapid task or the dist task using the config
(rapid[process.argv[2]] || rapid.dist)(...process.argv.slice(3));
