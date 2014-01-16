/**
 * Bootstrap Altair instances based on a config
 */
require(['altair/Altair',
         'altair/cartridges/Foundry',
         'altair/config!core/config/altair.json'], function(Altair, Foundry, config){


    /**
     * Startup the cartridge factory and create the cartridges, then add
     * them to altair.
     */
    var altair  = new Altair(),
        factory = new Foundry(altair);

    console.log('Creating cartridge foundry. Adding', config.cartridges.length, 'cartridges.');

    factory.build(config.cartridges).then(function (cartridges) {


        console.log('Cartridges created. Adding to Altair for startup.');

        /**
         * Add cartridges
         */
        altair.addCartridges(cartridges).then(function () {

            console.log('Cartridges started.  ');

        });

    });

});