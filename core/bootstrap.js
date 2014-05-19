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
        'altair/plugins/config!core/config/altair.json?env=' + global.env],

    function (Altair,
              require,
              Foundry,
              mixin,
              home,
              debug,
              path,
              config) {

        /**
         * Simple debug logging
         */
        debug.enable(config.debug);
        debug = debug('altair:Altair');

        /**
         * Bring in the packages from the config, this should point to at least app and core. Even though core is not
         * needed, this array is also used to build our lookup paths in altair. Altair only needs their names since
         * dojo's define() and require() can map it to their paths.
         */
        require({
            paths: config.paths
        });

        /**
         * You can override the main config by creating an .altair/ altair.json in you HOMEDIR
         */
        var homeConfigPath = path.join(home(),'.altair', 'altair.json');

        /**
         * Mixin config from app/config/altair.json if there is one
         */
        require([
            'altair/plugins/config!' + homeConfigPath + '?env' + global.env
        ], function (_config) {

            var paths = [],
                altair,
                foundry;

            if(!_config) {
                debug('no config found at', homeConfigPath, '. see docs/config.md for instructions.');
            }

            //one was found, mix it in
            if(_config) {
                config = mixin(config, _config);
            }

            Object.keys(config.paths).forEach(function (name) {
                paths.push(name);
            });

            /**
             * Startup the cartridge factory and create the cartridges, then add
             * them to altair.
             */
            altair      = new Altair({ paths: paths });
            foundry     = new Foundry(altair);

            debug('creating cartridge foundry. adding', config.cartridges.length, 'cartridges.');

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