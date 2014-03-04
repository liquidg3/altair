define(['doh/runner',
        'core/tests/support/boot',
        'dojo/Deferred',
        'dojo/has',
        'altair/facades/hitch',
        'altair/facades/mixin'],
    function (doh,
              boot,
              Deferred,
              has,
              hitch,
              mixin) {

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
                    paths: ['core/vendors'],
                    modules: ['Altair:Adapters'],
                    plugins: [
                        'altair/cartridges/module/plugins/Nexus',
                        'altair/cartridges/module/plugins/Deferred',
                        'altair/cartridges/module/plugins/Paths',
                        'altair/cartridges/module/plugins/Config',
                        'altair/cartridges/module/plugins/Events',
                        'altair/cartridges/module/plugins/Foundry',
                        'altair/cartridges/module/plugins/Apollo'
                    ]
                }
            }
        ];

        doh.register('altair-adapters-module', [


            /**
             * Test selected adapter as single
             *
             * @param t
             * @returns {*|Promise}
             */
            function (t) {

                return boot(cartridges).then(function (altair) {

                    var module = altair.cartridge('altair/cartridges/module/Module').module('Altair:Adapters'),
                        def    = new Deferred();

                    module.set('selectedAdapter', 'Altair:Adapters::adapters/Mock2');

                    return module.get('selectedAdapter').then(function (adapter) {
                        t.t(!!adapter, 'selected adapter failed.');
                        def.resolve(true);
                    }).otherwise(hitch(def, 'reject'));


                    return def;

                });

            },

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

                        var module = altair.cartridge('altair/cartridges/module/Module').module('Altair:Adapters'),
                            def = new Deferred();

                        module.adapter('adapters/Mock3').then(function (adapter) {
                            def.reject('Adapter resolved with bad key');
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
                        t.t( typeof adapter.foo === 'function', 'adapter load failed' );
                        t.is(adapter.foo(), 'Mock1', 'wrong adapter return');

                    });

                });

            },


            /**
             * Test selected adapter on start (which should come ready and callable from adapter()
             *
             * @param t
             * @returns {*|Promise}
             */
                function (t) {

                var _cartridges = cartridges.slice(0);

                _cartridges[2].options = mixin({
                    moduleOptions: {
                        'Altair:Adapters': {
                            'selectedAdapter': 'Altair:Adapters::adapters/Mock2'
                        }
                    }
                }, _cartridges[2].options);

                return boot(_cartridges).then(function (altair) {

                    var module = altair.cartridge('altair/cartridges/module/Module').module('Altair:Adapters');

                    var adapter = module.adapter();

                    t.is(adapter.foo(), 'Mock2', 'Selected adapter on startup failed.');


                });

            }


        ]);


    });