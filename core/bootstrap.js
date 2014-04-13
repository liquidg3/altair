/**
 * Bootstrap Altair instances based on a config
 */
require(['altair/Altair',
        'require',
        'altair/cartridges/Foundry',
        'altair/facades/hitch',
        'altair/facades/mixin',
        'altair/plugins/config!core/config/altair.json?env=' + global.env],

    function (Altair,
              require,
              Foundry,
              hitch,
              mixin,
              config) {


        /**
         * Bring in the packages from the config, this should point to at least app and core. Even though core is not
         * needed, this array is also used to build our lookup paths in altair. Altair only needs their names since
         * dojo's define() and require() can map it to their paths.
         */
        require({
            paths: config.paths
        });

        /**
         * Mixin config from app/config/altair.json if there is one
         */
        require([
            'altair/plugins/config!app/config/altair.json?env' + global.env
        ], function (_config) {

            var paths = [],
                altair,
                foundry;


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

            console.log('Creating cartridge foundry. Adding', config.cartridges.length, 'cartridges.');

            foundry.build(config.cartridges).then(function (cartridges) {

                console.log('Cartridges created. Adding to Altair for startup.');

                /**
                 * Add cartridges
                 */
                altair.addCartridges(cartridges).then(function () {

                    console.log('Cartridges started.  ');

                }).otherwise(hitch(console, 'error'));

            }).otherwise(hitch(console, 'error'));

        });


    });