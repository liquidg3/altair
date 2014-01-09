define(['doh/runner', 'altair/CartridgeFactory', 'dojo/_base/declare'], function (doh, CartridgeFactory, declare) {

    /**
     * Dummy Cartridges
     */
//    var cart

    /**
     * Make sure we can construct a CartridgeFactory instance
     */
    doh.register('cartridge-construct',
        function () {

            var factory = new CartridgeFactory();
            doh.assertTrue(!!factory);

        }
    );



});