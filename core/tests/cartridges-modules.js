define(['doh/runner',
        'altair/cartridges/module/Module',
        'altair/cartridges/extension/Extension',
        'altair/cartridges/nexus/Nexus',
        'altair/Altair',
        'altair/Deferred',
        'altair/facades/declare',
        'altair/facades/hitch',
        'altair/cartridges/module/Foundry'],
                            function (doh,
                                      ModuleCartridge,
                                      ExtensionCartridge,
                                      NexusCartridge,
                                      Altair,
                                      Deferred,
                                      declare,
                                      hitch,
                                      Foundry) {

    /**
     * Dependencies
     */
    var testPaths       = ['core/tests/modules/vendors'],
        altairTestPaths = ['core/tests/modules'];

    doh.register('modules', {

        "test instantiating module cartridge": function () {

            var altair      = new Altair(),
                cartridge   = new ModuleCartridge(altair);

            doh.assertTrue(!!cartridge, 'Instantiating cartridge failed.');

        },

        "test creating module cartridge": function () {

            var foundry = new Foundry();
            doh.assertTrue(!!foundry, 'Foundry instantiation failed');

        },

        "test building modules with foundry": function (t) {

            var foundry = new Foundry();

            return foundry.build({
                paths: testPaths,
                modules: ['altair:Mock']
            }).then(function (modules) {

                var altair = modules[0];
                t.is('altair:Mock', altair.name, 'Module name did not work right yo.');

            });

        },

        "test foundry searching paths for module by name that is not found": function (t) {

            var foundry = new Foundry(),
                d       = new Deferred();

            foundry.build({
                paths: testPaths,
                modules: ["altair:NeverFound"]
            }).then(function () {
                throw new Error("SHOULD NEVER BE CALLED");
            }).otherwise(function (err) {
                t.t(err.message.search('Failed to load one or more modules: altair:NeverFound') > -1, err.message);
                d.resolve();
            });

            return d;
        },

        "test searching paths for module by name": function (t) {

            var foundry     = new Foundry();

            return foundry.build({
                paths: testPaths,
                modules: ["altair:Mock"]
            }).then(function (modules) {
                t.is(1, modules.length, 'Passing modules to foundry did not produce expected results.');
            });

        },

        "make extension cartridge get loaded at startup": function (t) {

            var altair      = new Altair(),
                cartridge   = new ExtensionCartridge(altair, {
                    extensions: [
                        'core/tests/extensions/Mock1'
                    ]
                });

            return altair.addCartridge(cartridge).then(function () {

                t.t(cartridge.hasExtension('mock1'), 'Extension cartridge failed to create plugins');
                t.is('bar', cartridge.extension('mock1').foo, 'Mock plugin failed.');

            });


        },


        "test that module cartridge can create some modules when passed through to altair": function (t) {

            var altair      = new Altair(),
                cartridge   = new ModuleCartridge(altair, {
                    paths: testPaths,
                    modules: ["altair:Mock"]
                });


            return altair.addCartridge(cartridge).then(function () {

                doh.assertEqual(1, cartridge.modules.length, 'Module creation failed through Altair and the ModuleCartridge');
                doh.assertEqual('altair:Mock', cartridge.modules[0].name, 'Module name was not set.');

            });

        },

        "test to make sure the mock2 class can access the mock1/mixin/_MockMixin": function () {

            var deferred    = new doh.Deferred(),
                altair      = new Altair(),
                cartridge   = new ModuleCartridge(altair, {
                    paths: testPaths,
                    modules: ['altair:Mock', 'altair:Mock2']
                });


            altair.addCartridge(cartridge).then(deferred.getTestCallback(function () {

                var mock2 = cartridge.module('altair:Mock2');

                doh.assertTrue(mock2.mockMixinSuccess, '_MockMixin failed to mixin');

            })).otherwise(hitch(deferred, 'reject'));

            return deferred;

        },

        "test module resolver for nexus": function (t) {

            var altair      = new Altair(),
                nexus       = new NexusCartridge(altair),
                modules     = new ModuleCartridge(altair, {
                    paths: testPaths,
                    modules: ["altair:Mock"]
                });


            return altair.addCartridges([nexus, modules]).then(function () {

                var mock = nexus.resolve('altair:Mock');
                t.t(!!mock, 'nexus could not resolve altair:Mock');

            });
        },


        "ensure that the module cartridge will fallback onto altair's paths": function (t) {

            var altair      = new Altair({
                    paths: altairTestPaths
                }),
                cartridge   = new ModuleCartridge(altair, {
                    modules: ['altair:Mock', 'altair:Mock2']
                });


            return altair.addCartridge(cartridge).then(function () {

                var mock2 = cartridge.module('altair:Mock2');
                t.t(!!mock2, 'Module cartridge did not fallback to use altair\'s paths.');

            });


        }


    });


});