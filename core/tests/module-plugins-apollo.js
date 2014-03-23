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
                    paths: ['core/tests/modules/vendors'],
                    modules: ['altair:Mock'],
                    plugins: [
                        "altair/cartridges/module/plugins/Paths",
                        "altair/cartridges/module/plugins/Config",
                        "altair/cartridges/module/plugins/Package",
                        "altair/cartridges/module/plugins/Deferred",
                        "altair/cartridges/module/plugins/Apollo",
                        "altair/cartridges/module/plugins/Nexus",
                        "altair/cartridges/module/plugins/Events",
                        "altair/cartridges/module/plugins/Foundry"
                    ]
                }
            }
        ];



        doh.register('module-plugins-apollo', [

            /**
             * Test that the Apollo plugin loads a schema proper! The mock module should have the schema defined in
             * ./config/schema.json.
             */
             function () {

                return boot(cartridges).then(function (altair) {

                    var module = altair.cartridge('altair/cartridges/module/Module').module('altair:Mock');

                    doh.assertEqual('bar', module.get('foo'), 'altair:Mock did not get a schema.');


                });


            }

        ]);


    });