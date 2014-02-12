/**
 * Allow us to run some nexus tests
 */

define(['doh/runner',
    'altair/cartridges/Foundry',
    'altair/facades/hitch',
    'altair/Altair'],

    function (doh,
              CartridgeFoundry,
              hitch,
              Altair) {


        /**
         * Boot altair and then do something
         * @returns {dojo.tests._base.Deferred}
         */
        var boot = function (callback) {

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
                        plugins:    ['altair/cartridges/module/plugins/Nexus', 'altair/cartridges/module/plugins/Events']
                    }
                }
            ]).then(deferred.getTestCallback(function (cartridges) {

                altair.addCartridges(cartridges).then(function () {
                    callback(altair.cartridge('altair/cartridges/module/Module').modules);
                }).otherwise(hitch(deferred, 'reject'));

            }));


            return deferred;

        };


        doh.register('module-plugins-nexus', [

            /**
             * Test some nexus 101, get module by name
             */
            function () {


                return boot(function (modules) {

                    var m   = modules[0],
                        m2  = m.nexus('Altair:MockWithEvents'); //find another module that is currently loaded

                    doh.assertTrue(!!m2, 'Nexus fail');
                    doh.assertEqual('Altair:MockWithEvents', m2.name, 'Nexus resolution failed');

                });


            }

        ]);


    });