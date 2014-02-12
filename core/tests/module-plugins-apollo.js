define(['doh/runner',
        'altair/cartridges/Foundry',
        'altair/Altair',
        'altair/facades/hitch'],
    function (doh,
              CartridgeFoundry,
              Altair,
              hitch) {


        /**
         * Bootstraps an altair environment to load your plugins. The deferred will resolve with all the
         * modules loaded
         *
         * @param plugins
         * @returns {dojo.tests._base.Deferred}
         */
        var boot = function (callback) {

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
                        paths:      ['core/tests/modules/vendors'],
                        modules:    ['Altair:Mock'],
                        plugins:    ['altair/cartridges/module/plugins/Paths', 'altair/cartridges/module/plugins/Config', 'altair/cartridges/module/plugins/Apollo']
                    }
                }
            ]).then(deferred.getTestCallback(function (cartridges) {

                altair.addCartridges(cartridges).then(function () {
                    callback(altair.cartridge('altair/cartridges/module/Module').modules);
                }).otherwise(hitch(deferred, 'reject'));

            })).otherwise(hitch(deferred, 'reject'));

            return deferred;

        };


        doh.register('module-plugins-apollo', [

            /**
             * Test that the Apollo plugin loads a schema proper! The mock module should have the schema defined in
             * ./config/schema.json.
             */
             function () {

                return boot(function (modules) {

                    var module = modules[0];

                    doh.assertEqual('bar', module.get('foo'), 'Altair:Mock did not get a schema.');


                });


            }

        ]);


    });