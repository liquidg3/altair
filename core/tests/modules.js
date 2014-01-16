define(['doh/runner',
        'altair/cartridges/module/Module',
        'altair/Altair',
        'dojo/_base/lang',
        'altair/cartridges/module/Foundry'],
                            function (doh,
                                      ModuleCartridge,
                                      Altair,
                                      lang,
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
            }).then(deferred.getTestCallback(lang.hitch(this, function (modules) {

                var altair = modules[0];
                doh.assertEqual('Altair:Mock', altair.name, 'Module name did not work right yo.');

            })));


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
            }).then(deferred.getTestCallback(lang.hitch(this, function (modules) {
                doh.assertEqual(0, modules.length, 'No modules should have been created.');

            })));


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
            }).then(deferred.getTestCallback(lang.hitch(this, function (modules) {
                doh.assertEqual(1, modules.length, 'Passing modules to foundry did not produce expected results.');
            })));


            return deferred;
        },

        /**
         * Test that module cartridge can create some modules when passed through to Altair
         */
        function () {

            var deferred    = new doh.Deferred(),
                altair      = new Altair(),
                cartridge   = new ModuleCartridge(altair, {
                    paths: testPaths,
                    modules: ["Altair:Mtock"]
                });


            altair.addCartridge(cartridge).then(deferred.getTestCallback(lang.hitch(this, function () {


                doh.assertEqual(1, cartridge.modules.length, 'Module creation failed through Altair and the ModuleCartridge');
                doh.assertEqual('Altair:Mock', cartridge.modules[0].name, 'Module name was not set.');



            })));

        }

    ]);


});