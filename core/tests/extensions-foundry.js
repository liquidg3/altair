define(['doh/runner',
        'require',
        'core/tests/support/boot'
],
    function (doh,
              require,
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
                path: 'altair/cartridges/module/Module',
                options: {
                    paths: ['core/tests/modules/vendors'],
                    modules: ['altair:Mock', 'altair:Mock2']
                }
            },
            {
                path: 'altair/cartridges/extension/Extension',
                options: {
                    extensions: [
                        "altair/cartridges/extension/extensions/Paths",
                        "altair/cartridges/extension/extensions/Nexus",
                        "altair/cartridges/extension/extensions/Foundry",
                        "core/tests/extensions/Mock3"

                    ]
                }
            }
        ];

        doh.register('extensions-foundry', {


            "test forging mock sub component": function (t) {

                return boot.nexus(cartridges).then(function (nexus) {

                    var m = nexus('altair:Mock');

                    return m.forge('test/Component').then(function (test) {

                        var dir = require.toUrl('core/tests/modules/vendors/altair/modules/mock/test');

                        t.is(test.name, 'altair:Mock/test/Component');
                        t.is(test.dir, dir);
                        t.is(test.module, m, 'parent failed to be assigned');
                        t.t(!!test.forge, 'Foundry was not applied to forged component');


                    });


                });

            },

            "test extension only applied to mock sub component": function (t) {

                return boot.nexus(cartridges).then(function (nexus) {

                    var m = nexus('altair:Mock');

                    t.f(m.foo3, 'extension applied incorrectly');

                    return m.forge('test/Component').then(function (test) {

                        t.t(!!test.foo3, 'Foundry was not applied to forged component');


                    });


                });

            }


        });


    });