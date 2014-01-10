/**
 * Bootstrap Altair instances based on a config
 */
require(['altair/Altair',
         'altair/CartridgeFactory',
         'altair/config!core/config/altair.json'], function(Altair, CartridgeFactory, config){


    /**
     * Startup the cartridge factory and create the cartridges, then add
     * them to altair.
     *
     * @type {altair.CartridgeFactory}
     */
    var factory = new CartridgeFactory(),
        altair  = new Altair();

    console.log('Loading CartridgeFactory. Found ', config.cartridges.length, ' cartridges.');

    factory.build(config.cartridges).then(function (cartridges) {

        /**
         * Add cartridges
         */
        altair.addCartridges(cartridges).then(function () {

            console.log('Altair is ready');

        });

    });

});