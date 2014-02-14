/**
 * Boots you an instance of altair for testing purposes.
 *
 *
 */
define(['dojo/Deferred',
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
                    modules: ['Altair:MockWithEvents', 'Altair:MockWithEvents2', 'Altair:Events'],
                    plugins: ['altair/cartridges/module/plugins/Nexus', 'altair/cartridges/module/plugins/Events']
                }
            }
        ];



        return boot;


    });
