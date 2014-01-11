define(['doh/runner', 'altair/CartridgeFactory', 'dojo/_base/lang'], function (runner, CartridgeFactory, lang) {

    /**
     * Dependencies
     */
    var options   = {
            cartridges: [
                {
                    "name": "Mock",
                    "path": "altair/cartridges/Mock",
                    "options": {
                        foo: "bar"
                    }
                }
            ]
        };

    /**
     * Make sure we can construct a CartridgeFactory instance
     */
    runner.register('cartridge-construct',
        function () {

            var factory = new CartridgeFactory();
            runner.assertTrue(!!factory);

        }
    );

    /**
     * Build some cartridges and test to make sure they are started up
     */
    runner.register('cartridge-factory',
        function () {

            var factory = new CartridgeFactory(),
                deferred = new doh.Deferred();

            factory.build(options.cartridges).then(deferred.getTestCallback(lang.hitch(this, function (cartridges) {

                var mock = cartridges[0];

                runner.assertEqual(1, cartridges.length, 'Wrong number of cartridges created.');
                runner.assertEqual('bar', mock.options.foo, 'Options were not passed through to cartridge');
                runner.assertFalse(mock.startedUp, 'Cartridge should not be started up.');


            })));


            runner.assertTrue(!!factory);

            return deferred;

        }
    );


});