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
                    modules:    ['altair:MockWithEvents', 'altair:MockWithEvents2', 'altair:Events']
                }
            },
            {
                path: 'altair/cartridges/extension/Extension',
                options: {
                    extensions:    ['altair/cartridges/extension/extensions/Nexus', 'altair/cartridges/extension/extensions/Events']
                }
            },
        ];



        doh.register('extensions-nexus', {

            /**
             * Test some nexus 101, get module by name
             */
            "test resolving module name": function (t) {


                return boot.nexus(cartridges).then(function (nexus) {

                    var m2  = nexus('altair:MockWithEvents'); //find another module that is currently loaded

                    t.t(!!m2, 'Nexus fail');
                    t.is(m2.name, 'altair:MockWithEvents', 'Nexus resolution failed');

                    var m3 = m2.nexus('altair:Events');

                    t.t(!!m3, 'Nexus fail');
                    t.is(m3.name, 'altair:Events', 'Nexus resolution failed');


                });


            },

            /**
             * Make sure nexus can resolve cartridges
             */
            "test cartridge resolver": function (t) {


                return boot(cartridges).then(function (altair) {

                    var c   = altair.cartridge('module'),
                        m   = c.modules[0],
                        c2  = m.nexus('cartridges/Module'); //find another module that is currently loaded

                    t.t(!!c2, 'Nexus fail');

                    t.is(c.name, c2.name, 'Nexus resolution failed');

                });


            }

        });


    });