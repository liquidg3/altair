define(['altair/test', 'altair/cartridges/cache/Cache', 'altair/cartridges/cache/plugins/Mock', 'dojo/_base/lang', 'altair/Altair'], function (test, Cache, Mock, lang, Altair) {

    /**
     * Dependencies
     */
    var options = {
        plugin: {
            path: 'altair/cartridges/cache/plugins/Mock',
            options: {
                foo: 'bar'
            }
        }
    };

    test.register('cache', [

        /**
         * Make sure we can construct a cache cartridge instance
         */
        function () {

            var altair      = new Altair(),
                cartridge   = new Cache(altair, {});

            test.assertTrue(!!cartridge, 'Basic instantiation failed.');

        },

        /**
         * Make sure we create a mock plugin
         */
        function () {

            var deferred    = new test.Deferred(),
                altair      = new Altair(),
                cartridge   = new Cache(altair, {});

            cartridge.startup(options).then(deferred.getTestCallback(lang.hitch(this, function () {

                test.assertEqual('bar', cartridge.plugin.options.foo, 'Cache plugin options not set');
                test.assertTrue(cartridge.plugin.startedUp, 'Cache plugin not started');


            })));

            return deferred;


        }
    ]);


});