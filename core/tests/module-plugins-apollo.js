define(['doh/runner',
        'altair/cartridges/Foundry',
        'altair/Altair'],
    function (doh,
              CartridgeFoundry,
              Altair) {


        /**
         * Bootstraps an altair environment to load your plugins. The deferred will resolve with all the
         * modules loaded
         *
         * @param plugins
         * @returns {dojo.tests._base.Deferred}
         */
        var loadPlugins = function (plugins) {

            var deferred    = new doh.Deferred(),
                altair      = new Altair(),
                foundry     = new CartridgeFoundry(altair);


            foundry.build([
                {
                    path: 'altair/cartridges/apollo/Apollo',
                    options: {
                    }
                },
                {
                    path: 'altair/cartridges/module/Module',
                    options: {
                        paths:      ['altair/cartridges/module/test'],
                        modules:    ['Altair:Mock'],
                        plugins:    plugins
                    }
                }
            ]).then(function (cartridges) {

                altair.addCartridges(cartridges).then(function () {
                    deferred.resolve(altair.cartridge('altair/cartridges/module/Module').modules);
                });

            });


            return deferred;

        };


        doh.register('module-plugins-apollo', [

            /**
             * Test that the Apollo plugin loads a schema proper! The mock module should have the schema defined in
             * ./config/schema.json.
             */
             function () {

                var deferred = new doh.Deferred();

                loadPlugins(['altair/cartridges/module/plugins/Paths', 'altair/cartridges/module/plugins/Config', 'altair/cartridges/module/plugins/Apollo']).then(deferred.getTestCallback(function (modules) {

                    var module = modules[0];

                    doh.assertEqual('bar', module.get('foo'), 'Altair:Mock did not get a schema.');


                }));

                return deferred;


            }

        ]);


    });