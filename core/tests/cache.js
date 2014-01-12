define(['doh/runner', 'altair/cartridges/cache/Cache', 'altair/cartridges/cache/plugins/Mock', 'dojo/_base/lang'], function (doh, Cache, Mock, lang) {

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

    doh.register('cache', [

        /**
         * Make sure we can construct a cache cartridge instance
         */
        function () {

            var cartridge = new Cache();

            doh.assertTrue(!!cartridge, 'Basic instantiation failed.');

        },

        /**
         * Make sure we create a mock plugin
         */
        function () {

            var deferred    = new doh.Deferred(),
                cartridge   = new Cache();

            cartridge.startup(options).then(deferred.getTestCallback(lang.hitch(this, function () {

                doh.assertEqual('bar', cartridge.plugin.options.foo, 'Cache plugin options not set');
                doh.assertTrue(cartridge.plugin.startedUp, 'Cache plugin not started');


            })));

            return deferred;


        }
    ]);


});