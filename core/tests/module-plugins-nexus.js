/**
 * Allow us to run some nexus tests
 */

define(['doh/runner',
    'core/tests/support/boot'],

    function (doh,
              boot) {

        var cartridges = [
            {
                path: 'altair/cartridges/nexus/Nexus',
                options: {

                }
            },
            {
                path: 'altair/cartridges/apollo/Apollo',
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
        ];



        doh.register('module-plugins-nexus', [

            /**
             * Test some nexus 101, get module by name
             */
            function (t) {


                return boot(cartridges).then(function (altair) {

                    var m   = altair.cartridge('altair/cartridges/module/Module').modules[0],
                        m2  = m.nexus('Altair:MockWithEvents'); //find another module that is currently loaded

                    t.t(!!m2, 'Nexus fail');
                    t.is(m2.name, 'Altair:MockWithEvents', 'Nexus resolution failed');

                });


            },

            /**
             * Make sure nexus can resolve cartridges
             */
            function (t) {


                return boot(cartridges).then(function (altair) {

                    var c   = altair.cartridge('altair/cartridges/module/Module'),
                        m   = c.modules[0],
                        c2  = m.nexus('cartridges/Module'); //find another module that is currently loaded

                    t.t(!!c2, 'Nexus fail');

                    t.is(c.declaredClass, c2.declaredClass, 'Nexus resolution failed');

                });


            }

        ]);


    });