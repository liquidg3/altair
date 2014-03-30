/**
 * Boots you an instance of altair for testing purposes.
 *
 *
 */
define(['altair/Deferred',
        'altair/facades/hitch',
        'altair/cartridges/Foundry',
        'altair/Altair'],
    function (Deferred,
              hitch,
              Foundry,
              Altair) {

        var boot = function (cartridges) {

            var deferred = new Deferred(),
                altair = new Altair(),
                foundry = new Foundry(altair);

            foundry.build(cartridges || boot.cartridges).then(function (cartridges) {

                    altair.addCartridges(cartridges).then(function () {
                        deferred.resolve(altair);
                    }).otherwise(hitch(deferred, 'reject'));

                });


            return deferred;

        };

        boot.nexus = function (cartridges) {
            var d = new Deferred();
            boot(cartridges).then(function (altair) {

                var n = altair.cartridge('altair/cartridges/nexus/Nexus');

                if(!n) {
                    d.reject(new Error('tests/support/boot.js has to be configured with the Nexus cartridge for boot.nexus to work.'));
                } else {
                    d.resolve(hitch(n, n.resolve));
                }

            }).otherwise(hitch(d, 'reject'));
            return d;
        };


        boot.cartridges = [
            {
                path: 'altair/cartridges/nexus/Nexus',
                options: {

                }
            },
            {
                path: 'altair/cartridges/module/Module',
                options: {
                    paths: ['core/tests/modules/vendors', 'core/vendors'],
                    modules: ['altair:MockWithEvents', 'altair:MockWithEvents2', 'altair:Events'],
                    plugins: ['altair/cartridges/module/plugins/Nexus', 'altair/cartridges/module/plugins/Events']
                }
            }
        ];



        return boot;


    });
