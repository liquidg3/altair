define(['doh/runner',
        'core/tests/support/boot'],
    function (doh,
              boot) {

        var cartridges = [
            {
                path: 'altair/cartridges/apollo/Apollo',
                options: {

                }
            },
            {
                path: 'altair/cartridges/nexus/Nexus',
                options: {

                }
            },
            {
                path: 'altair/cartridges/extension/Extension',
                options: {
                    extensions: [
                        "altair/cartridges/extension/extensions/Paths",
                        "altair/cartridges/extension/extensions/Config",
                        "altair/cartridges/extension/extensions/Package",
                        "altair/cartridges/extension/extensions/Deferred",
                        "altair/cartridges/extension/extensions/Apollo",
                        "altair/cartridges/extension/extensions/Nexus",
                        "altair/cartridges/extension/extensions/Events",
                        "altair/cartridges/extension/extensions/Foundry"
                    ]
                }
            },
            {
                path: 'altair/cartridges/module/Module',
                options: {
                    paths: ['core/tests/modules/vendors'],
                    modules: ['altair:Mock']
                }
            }
        ];



        doh.register('extensions-apollo', {

            "test apollo extension": function (t) {

                return boot.nexus(cartridges).then(function (nexus) {

                    return nexus('altair:Mock').foundry('test/Component');

                }).then(function (comp) {

                    t.is(comp.get('foo'), 'bar', 'Component did not get schema');

                });


            }

        });


    });