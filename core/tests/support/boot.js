/**
 * Boots you an instance of altair for testing purposes.
 */
define(['altair/Deferred',
        'altair/facades/hitch',
        'altair/cartridges/Foundry',
        'altair/Altair'],
    function (Deferred,
              hitch,
              Foundry,
              Altair) {

        var boot = function (cartridges, altairOptions) {

            var deferred    = new Deferred(),
                altair      = new Altair(altairOptions || {}),
                foundry     = new Foundry(altair);

            foundry.build(cartridges || boot.cartridges).then(function (cartridges) {

                altair.addCartridges(cartridges).then(function () {
                    deferred.resolve(altair);
                }).otherwise(hitch(deferred, 'reject'));

            });


            return deferred;

        };

        boot.nexus = function (cartridges) {

            return boot(cartridges).then(function (altair) {

                var n = altair.cartridge('nexus');

                if(!n) {
                    throw new Error('tests/support/boot.js has to be configured with the Nexus cartridge for boot.nexus to work.');
                } else {
                    return hitch(n, n.resolve);
                }

            });

        };


        boot.cartridges = [
            {
                path: 'altair/cartridges/nexus/Nexus',
                options: {

                }
            },
            {
                path: 'altair/cartridges/extension/Extension',
                options: {
                    extensions: ['altair/cartridges/extension/extensions/Nexus', 'altair/cartridges/extension/extensions/Events']
                }
            },
            {
                path: 'altair/cartridges/module/Module',
                options: {
                    paths: ['core/tests/modules/vendors', 'core/vendors'],
                    modules: ['altair:MockWithEvents', 'altair:MockWithEvents2', 'altair:Events'],
                }
            }
        ];


        return boot;


    });
