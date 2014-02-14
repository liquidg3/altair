/**
 * Allow us to run some nexus tests
 */

define(['doh/runner',
    'core/tests/support/boot'],

    function (doh,
              boot) {

        boot.cartridges = [
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
        ];



        doh.register('module-plugins-nexus', [

            /**
             * Test some nexus 101, get module by name
             */
            function (t) {


                return boot().then(function (altair) {

                    var m   = altair.cartridge('altair/cartridges/module/Module').modules[0],
                        m2  = m.nexus('Altair:MockWithEvents'); //find another module that is currently loaded

                    t.t(!!m2, 'Nexus fail');
                    t.is(m2.name, 'Altair:MockWithEvents', 'Nexus resolution failed');

                });


            }

        ]);


    });