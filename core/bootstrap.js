/**
 * Bootstrap Altair instances based on a config
 */
require(['altair/Altair',
    'require',
    'altair/cartridges/Foundry',
    'altair/facades/mixin',
    'altair/facades/home',
    'altair/plugins/node!debug',
    'altair/plugins/node!path',
    'altair/plugins/node!fs',
    'altair/plugins/node!module',
    'altair/plugins/node!config-extend',
    'lodash',
    'altair/plugins/config!core/config/altair.json?env=' + global.env],

    function (Altair, require, Foundry, mixin, home, debug, path, fs, Module, extend, _, config) {

        /**
         * Simple debug logging
         */
        debug.enable(config.debug);
        debug       = debug('altair:Altair');
        require.log = debug; //overrides the require.log used by dojo to provide much better high level reporting

        /**
         * Make sure our CWD is set
         */
        if(global.cwd != process.cwd()) {
            process.chdir(cwd);
        }

        /**
         * Lets you configure how much error reporting to do.
         *
         * @type {number}
         */
        Error.stackTraceLimit = config.stackTraceLimit || Infinity;


        /**
         * NPM has zero dependency injection so it's easier to create a central place for altair to manage
         * all node dependencies than it is to configure npm (at all). This is where all the dependencies
         * for altair modules/themes/widgets/sites will be installed.
         */
        var homePath        = path.join(home(), '.altair'),
            homeConfigPath  = path.join(homePath, 'altair.json'),
            homePackagePath = path.join(homePath, 'package.json'),
            appConfigPath   = path.join(process.cwd(), 'altair.json');

        //does our run dir exist? move this to better installer
        try {

            fs.statSync(homePath);

        } catch (e) {

            debug('altair first run, creating ' + homePath);

            //create home
            fs.mkdirSync(homePath);
            fs.writeFileSync(homeConfigPath, JSON.stringify({
                'default': {
                    description: 'See https://github.com/liquidg3/altair/blob/master/docs/config.md for help on configuring altair.',
                    paths:       {
                        core: 'core'
                    }
                }
            }, null, 4));

            fs.writeFileSync(homePackagePath, JSON.stringify({
                name:        'altair-global',
                description: 'Placeholder altair config to hold dependencies of all installed modules.'
            }, null, 4));


        }

        /**
         * Mixin config from app/config/altair.json if there is one
         */
        require([
            'altair/plugins/config!' + appConfigPath + '?env=' + global.env,
            'altair/plugins/config!' + homeConfigPath + '?env=' + global.env
        ], function (cwdConfig, homeConfig) {

            var paths = [],
                altair,
                app,
                foundry;

            config.paths.home = homePath; //always have a home path

            //mixin configs, cwd config wins!
            if(cwdConfig) {

                //if the cwdConfig exists, it is our new "home" folder and everything will run/install from there
                debug('app detected - loading config @ ' + appConfigPath);

                extend(config, cwdConfig);

                //our new home (also make sure it's in the paths)
                app = process.cwd();
                config.paths.app = app;

            } else {

                debug('loading config @ ' + homeConfigPath);
                config = mixin(config, homeConfig);

            }

            /**
             * Make sure npm can look at our current app directory, fallback to home. But NEVER both.
             *
             * @type {string}
             */
            process.env['NODE_PATH'] += ":" + path.join(homePath, 'node_modules');
            if(app) { //app (which is cwd if altair.json exists) is a valid lookup spot
                process.env['NODE_PATH'] += ":" + path.join(app, 'node_modules');
            }
            Module._initPaths(); // terrible

            /**
             * Bring in the packages from the config, this should point to at least app and core. Even though core is not
             * needed, this array is also used to build our lookup paths in altair. Altair only needs their names since
             * dojo's define() and require() can map it to their paths.
             */
            require({
                paths: config.paths
            });

            //cartridges are given a key in the config so they can be overridden easier.
            config.cartridges = _.toArray(config.cartridges);

            //paths by name for altair
            Object.keys(config.paths).forEach(function (name) {
                paths.push(name);
            });

            /**
             * Startup the cartridge factory and create the cartridges, then add
             * them to altair.
             */
            altair  = new Altair({ paths: paths, safeMode: global.safe, home: homePath });
            foundry = new Foundry(altair);

            if (altair.safeMode) {
                debug('-- starting altair in safe mode --');
            }

            debug('creating cartridge foundry. adding ' +  config.cartridges.length + ' cartridges.');

            foundry.build(config.cartridges).then(function (cartridges) {

                debug('cartridges created. adding to altair for startup.');

                /**
                 * Add cartridges
                 */
                return altair.addCartridges(cartridges).then(function () {

                    debug('cartridges started.');

                });

            }).otherwise(debug);

        });


    });