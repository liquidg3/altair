/**
 * These tests are for the events plugin for the module cartridge. It requires the Nexus and Module cartridges, as well
 * as a bunch of plugins I can't think of off the top of my head. see code below:
 */

define(['doh/runner',
    'altair/cartridges/Foundry',
    'altair/Altair'],
    function (doh,
              CartridgeFoundry,
              Altair) {


        /**
         * Boot altair and then do something
         * @returns {dojo.tests._base.Deferred}
         */
        var boot = function () {

            var deferred    = new doh.Deferred(),
                altair      = new Altair(),
                foundry     = new CartridgeFoundry(altair);

            foundry.build([
                {
                    path: 'altair/cartridges/nexus/Nexus',
                    options: {

                    }
                },
                {
                    path: 'altair/cartridges/module/Module',
                    options: {
                        paths:      ['core/tests/modules/vendors', 'core/vendors'],
                        modules:    ['Altair:MockWithEvents', 'Altair:MockWithEvents2', 'Altair:Events'],
                        plugins:    ['altair/cartridges/module/plugins/Events']
                    }
                }
            ]).then(function (cartridges) {

                altair.addCartridges(cartridges).then(function () {
                    deferred.resolve(altair.cartridge('altair/cartridges/module/Module').modules);
                }).otherwise(function (err) {
                    deferred.reject(err);
                });

            });


            return deferred;

        };


        doh.register('module-plugins-events', [

            /**
             * Test that the Apollo plugin loads a schema proper! The mock module should have the schema defined in
             * ./config/schema.json.
             */
            function () {


                var deferred = new doh.Deferred();

                boot().then(deferred.getTestCallback(function (modules) {

                    var m = modules[0];

                })).otherwise(function (err) {
                    deferred.reject(err);
                });

                return deferred;



            }

        ]);


    });