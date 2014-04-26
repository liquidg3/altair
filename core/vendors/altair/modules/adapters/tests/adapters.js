define(['doh/runner',
        'core/tests/support/boot',
        'altair/Deferred',
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
                    modules: ['altair:Adapters', 'altair:Events']
                }
            },
            {
                path: 'altair/cartridges/extension/Extension',
                options: {
                    extensions: [
                        'altair/cartridges/extension/extensions/Nexus',
                        'altair/cartridges/extension/extensions/Deferred',
                        'altair/cartridges/extension/extensions/Paths',
                        'altair/cartridges/extension/extensions/Config',
                        'altair/cartridges/extension/extensions/Events',
                        'altair/cartridges/extension/extensions/Foundry',
                        'altair/cartridges/extension/extensions/Apollo'
                    ]
                }
            }
        ];

        doh.register('altair-adapters-module', {


            "test selected adapter as single": function (t) {

                return boot.nexus(cartridges).then(function (nexus) {

                    var module = nexus('altair:Adapters');

                    module.set('selectedAdapter', 'altair:Adapters/adapters/Mock2');

                    return module.get('selectedAdapter').then(function (adapter) {
                        t.t(!!adapter, 'selected adapter failed.');
                    });


                });

            },

            "test failed to find adapter":  function (t) {

                return boot.nexus(cartridges).then(function (nexus) {

                    var module = nexus('altair:Adapters'),
                        def = new Deferred();

                    module.adapter('adapters/Mock3').then(function (adapter) {
                        def.reject('Adapter resolved with bad key');
                    }).otherwise(function () {
                        def.resolve();
                    });

                    return def;
                });


            },

            "make sure I can get an adapter by key": function (t) {

                return boot.nexus(cartridges).then(function (nexus) {

                    var module = nexus('altair:Adapters');

                    return module.adapter('adapters/Mock1').then(function (adapter) {
                        t.t( typeof adapter.foo === 'function', 'adapter load failed' );
                        t.is(adapter.foo(), 'Mock1', 'wrong adapter return');

                    });

                });

            },

             "test selected adapter on start ": function (t) {

                var _cartridges = cartridges.slice(0);

                _cartridges[2].options = mixin({
                    moduleOptions: {
                        'altair:Adapters': {
                            'selectedAdapter': 'altair:Adapters::adapters/Mock2'
                        }
                    }
                }, _cartridges[2].options);

                return boot.nexus(_cartridges).then(function (nexus) {

                    var module  = nexus('altair:Adapters'),
                        adapter = module.adapter();

                    t.t(!!adapter.foo, 'selected adapter did not initialize at startup.');

                    t.is(adapter.foo(), 'Mock2', 'Selected adapter on startup failed.');


                });

            }


        });


    });