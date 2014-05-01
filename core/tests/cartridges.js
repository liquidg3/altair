define(['doh/runner',
        'altair/Altair',
        'altair/Deferred',
        'altair/cartridges/Foundry',
        'altair/facades/hitch'],

    function (runner,
              Altair,
              Deferred,
              Foundry,
              hitch) {

    /**
     * Dependencies
     */
    var options   = {
            cartridges: [
                {
                    "path": "core/tests/cartridges/Mock",
                    "options": {
                        foo: "bar"
                    }
                }
            ]
        };


    runner.register('cartridges', {

        "test instantiating cartridge foundry": function (t) {

            var altair  = new Altair(),
                foundry = new Foundry(altair);

            t.t(!!foundry);

        },


        /**
         * Build some cartridges and test to make sure they are started up
         */
        "test building but not starting a cartridge": function (t) {

            var altair      = new Altair(),
                foundry     = new Foundry(altair);

            return foundry.build(options.cartridges).then(function (cartridges) {

                var mock = cartridges[0];

                t.is(1, cartridges.length, 'Wrong number of cartridges created.');
                t.is('bar', mock.options.foo, 'Options were not passed through to cartridge');
                t.f(mock.startedUp, 'Cartridge should not be started up.');


            });



        }

    });


});
