define(['doh/runner',
        'altair/cartridges/module/Module',
        'altair/cartridges/nexus/Nexus',
        'altair/Altair',
        'altair/cartridges/module/Foundry'],
                            function (doh,
                                      ModuleCartridge,
                                      NexusCartridge,
                                      Altair,
                                      Foundry) {

    /**
     * Dependencies
     */
    var testPaths = ['altair/cartridges/module/test'],
        nexusMaps = {
        'Altair:Jarvis': 'core/vendors/altair/modules/'
    };

    doh.register('modules', [

        /**
         * Basic instantiation
         */
        function () {

            var altair      = new Altair(),
                cartridge   = new ModuleCartridge(altair);

            doh.assertTrue(!!cartridge, 'Instantiating cartridge failed.');

        },

        /**
         * Foundry instantiation
         */
        function () {

            var foundry = new Foundry();
            doh.assertTrue(!!foundry, 'Foundry instantiation failed');

        },

        /**
         * Foundry directory parsing tests
         */
        function () {

            var foundry = new Foundry(),
                deferred = new doh.Deferred();

            foundry.build({
                paths: testPaths
            }).then(deferred.getTestCallback(function (modules) {

                var altair = modules[0];
                doh.assertEqual('Altair:Mock', altair.name, 'Module name did not work right yo.');

            }));


            return deferred;
        },

        /**
         * Foundry directory parsing with list of enabled modules to go with it.
         */
        function () {

            var foundry = new Foundry(),
                deferred = new doh.Deferred();

            foundry.build({
                paths: testPaths,
                modules: ["Altair:NeverFound"]
            }).then(deferred.getTestCallback(function (modules) {
                doh.assertEqual(0, modules.length, 'No modules should have been created.');

            }));


            return deferred;
        },

        /**
         * Foundry directory parsing with list of enabled modules to go with it.
         */
        function () {

            var foundry     = new Foundry(),
                deferred    = new doh.Deferred();

            foundry.build({
                paths: testPaths,
                modules: ["Altair:Mock"]
            }).then(deferred.getTestCallback(function (modules) {
                doh.assertEqual(1, modules.length, 'Passing modules to foundry did not produce expected results.');
            }));


            return deferred;
        },

        /**
         * Make sure module cartridge plugins get loaded at startup
         *
         * @returns {dojo.tests._base.Deferred}
         */
        function () {

            var deferred    = new doh.Deferred(),
                altair      = new Altair(),
                cartridge   = new ModuleCartridge(altair, {
                    paths: testPaths,
                    modules: [],
                    plugins: [
                        'altair/cartridges/module/plugins/Nexus',
                        'altair/cartridges/module/plugins/Mock'
                    ]
                });

            cartridge.startup().then(deferred.getTestCallback(function () {

                var plugins = cartridge.plugins;

                doh.assertEqual(2, plugins.length, 'Module cartridge failed to create plugins');
                doh.assertEqual('bar', plugins[1].foo, 'Mock plugin failed.');

            }));


            return deferred;
        },


        /**
         * Test the nexis plugin and make sure it adds a _nexus instance and nexus() and that the
         * Mock plugin adds property called "foo" with a value of "bar" to all modules being created in the module
         * cartridge.
         *
         * I'm not sure if i needed to increase the timeout to 500 or even why i did this one unlike the others, just lots of testing i guess =)
         */
        {
            name: 'cartridgeWithPluginsAndModules',
            timeout: 5000,
            runTest: function () {

                var deferred    = new doh.Deferred(),
                    altair      = new Altair(),
                    cartridge   = new ModuleCartridge(altair, {
                        paths: testPaths,
                        modules: ["Altair:Mock"],
                        plugins: [
                            'altair/cartridges/module/plugins/Nexus',
                            'altair/cartridges/module/plugins/Mock'
                        ]
                    });

                cartridge.startup().then(function () {

                    cartridge.execute().then(function () {

                        doh.assertTrue(!!cartridge.modules, 'module cartridge failed to create modules when plugins were passed too');
                        doh.assertEqual(1, cartridge.modules.length, 'module cartridge failed to create modules when plugins were passed too');
                        doh.assertEqual('bar', cartridge.modules[0].foo(), 'Mock plugin failed to create foo() method.');
                        doh.assertEqual('nexus', cartridge.modules[0].nexus.nom, 'Mock plugin failed to create nexus() method.');
                        doh.assertTrue(cartridge.modules[0].startedUp, 'Mock plugin was not started up.');

                        deferred.resolve(true)

                    });



                });


                return deferred;

            }
        },

        /**
         * Test that module cartridge can create some modules when passed through to Altair
         */
        function () {

            var deferred    = new doh.Deferred(),
                altair      = new Altair(),
                cartridge   = new ModuleCartridge(altair, {
                    paths: testPaths,
                    modules: ["Altair:Mock"]
                });


            altair.addCartridge(cartridge).then(deferred.getTestCallback(function () {

                doh.assertEqual(1, cartridge.modules.length, 'Module creation failed through Altair and the ModuleCartridge');
                doh.assertEqual('Altair:Mock', cartridge.modules[0].name, 'Module name was not set.');

            }));

        },

        /**
         * Test module resolver for nexus
         */
        function () {

            var deferred    = new doh.Deferred(),
                altair      = new Altair(),
                nexus       = new NexusCartridge(altair),
                modules     = new ModuleCartridge(altair, {
                    paths: testPaths,
                    modules: ["Altair:Mock"]
                });


            altair.addCartridges([nexus, modules]).then(deferred.getTestCallback(function () {

                var mock = nexus.resolve('Altair:Mock');

            }));

        }

    ]);


});