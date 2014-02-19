define(['doh/runner',
        'core/tests/support/boot',
        'dojo/Deferred',
        'dojo/has',
        'altair/facades/hitch'],
    function (doh,
              boot,
              Deferred,
              has,
              hitch) {

        var cartridges = [
            {
                path: 'altair/cartridges/nexus/Nexus',
                options: {

                }
            },
            {
                path: 'altair/cartridges/module/Module',
                options: {
                    paths: ['core/vendors'],
                    modules: ['Altair:Adapters'],
                    plugins: [
                        'altair/cartridges/module/plugins/Nexus',
                        'altair/cartridges/module/plugins/Deferred',
                        'altair/cartridges/module/plugins/Paths',
                        'altair/cartridges/module/plugins/Config',
                        'altair/cartridges/module/plugins/Events',
                        'altair/cartridges/module/plugins/Foundry'
                    ]
                }
            }
        ];

        doh.register('altair-adapters-module', [

            /**
             * Test failed to find adapter
             *
             * @param t
             * @returns {*|Promise}
             */
            {
                setUp: function () {

                    has.add("config-deferredInstrumentation", 0, null, true);

                },

                name: 'should-fail',

                tearDown: function () {
                    has.add("config-deferredInstrumentation", 1, null, true);
                },

                runTest: function (t) {

                    return boot(cartridges).then(function (altair) {

                        var module = altair.cartridge('altair/cartridges/module/Module').module('Altair:Adapters');

                        var def = new Deferred();

                        module.adapter('adapters/Mock3').then(function (adapter) {

                            def.reject('Adapter resolved with bad key')

                            has.add("config-deferredInstrumentation", 1, null, true);

                        }).otherwise(function () {
                            has.add("config-deferredInstrumentation", 1, null, true);
                            def.resolve();
                        });

                        return def;

                    });


                }
            },

            /**
             * Make sure I can get an adapter by key
             */
            function (t) {

                return boot(cartridges).then(function (altair) {


                    var module = altair.cartridge('altair/cartridges/module/Module').module('Altair:Adapters');


                    return module.adapter('adapters/Mock1').then(function (adapter) {

                        t.t('foo' in adapter, 'adapter load failed');
                        t.is(adapter.foo(), 'Mock1', 'wrong adapter return');

                    });

                });


            }



        ]);


    });