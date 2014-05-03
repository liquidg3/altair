#!/usr/bin/env node

/**
 * This file exists to bootstrap the dojo environment, which in turn bootstraps altair. Because you can pass any bootstrap
 * file you want with --bootstrap
 *
 * @type {exports}
 */

var path = require('path'),
    argv = require('yargs').usage('Altair - Experiences of Everything\n Usage: $0').options('env', {
                'default': 'dev',
                describe: 'specify the environment you want to run'
            }).options('bootstrap', {
                'default': 'core/bootstrap',
                describe: 'change the bootstrap file used by Altair'
            }).boolean('help').alias('help', 'h').describe('help', 'display help').boolean('test').describe('test', 'run our unit tests').argv;

if(argv.help) {
    require('yargs').showHelp();
    return;
}

var base = path.join('node_modules', 'altair.io');

// Configuration Object for Dojo Loader:
dojoConfig = {
    baseUrl: path.resolve(__dirname, '../../'), // Where we will put our packages
    async: 1, // We want to make sure we are using the "modern" loader
    has: {
        'config-tlmSiblingOfDojo': 0 //for relative path resolution from require() - setting to true breaks it, dojo.js 944
    },

    packages: [
        {
            name: 'lodash',
            location: path.join(base, "core/lib/lodash"),
            main: 'lodash'
        },
        {
            name: "dojo",
            location: path.join(base, "core/lib/dojo")
        },
        {
            name: "altair",
            location: path.join(base, "core/lib/altair")
        },
        {
            name: "core",
            location: path.join(base, "core")
        },
        {
            name: "doh",
            location: path.join(base, "core/lib/doh")
        },
        {
            name: "apollo",
            location: path.join(base, "core/lib/apollo")
        }
    ],
    map: {
         "*": {
            'dojo/_base/declare': 'altair/facades/declare'
         }

    },
    deps: [
        argv.bootstrap
    ]
};

if(argv.t || argv.test) {
    dojoConfig.deps = ['core/bootstrap-test'];
}

// Only exists to pass env to the bootstrap script (altair does not access any GLOBALS)
global.env =  argv.env;

// Now load the Dojo loader
require("./core/lib/dojo/dojo.js");
