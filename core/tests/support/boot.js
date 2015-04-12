/**
 * Boots you an instance of altair for testing purposes.
 */
define(['altair/Deferred',
        'altair/facades/hitch',
        'altair/cartridges/Foundry',
        'altair/plugins/node!module',
        'altair/plugins/node!path',
        'altair/Altair'],
    function (Deferred,
              hitch,
              Foundry,
              Module,
              path,
              Altair) {

        var initedPaths = false;

        var boot = function (cartridges, altairOptions) {

            var deferred,
                altair,
                foundry;

            //app testing help
            if (!initedPaths && altairOptions && altairOptions.paths && altairOptions.paths.indexOf('app') > -1) {
                process.env['NODE_PATH'] += ":" + path.join(process.cwd(), 'node_modules');
                Module._initPaths();
                initedPaths = true;
            }

            try {

                altair      = new Altair(altairOptions || {});
                foundry     = new Foundry(altair);

                deferred    = foundry.build(cartridges || boot.cartridges).then(function (cartridges) {

                    return altair.addCartridges(cartridges).then(function () {
                        return altair;
                    });

                });

            } catch(e) {

                deferred    = new Deferred();
                deferred.reject(e);

            }

            return deferred;

        };

        //same as above but gives you an instance of the altair nexus
        boot.nexus = function (cartridges, altairOptions) {

            return boot(cartridges, altairOptions).then(function (altair) {

                var n = altair.cartridge('nexus');

                if(!n) {
                    throw new Error('tests/support/boot.js has to be configured with the Nexus cartridge for boot.nexus to work.');
                } else {
                    return hitch(n, 'resolve');
                }

            });

        };

        //very basic default configuration of cartridges. not really used for anything but reference.
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
                    paths: ['core/tests/modules/vendors/modules', 'core/vendors/modules'],
                    modules: ['altair:MockWithEvents', 'altair:MockWithEvents2', 'altair:Events']
                }
            }
        ];


        return boot;


    });
