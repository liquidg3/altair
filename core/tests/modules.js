define(['doh/runner',
        'altair/cartridges/module/Module',
        'dojo/_base/lang',
        'altair/cartridges/module/Foundry'],
                            function (doh,
                                      Module,
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

            var cartridge = new Module();
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
        }

    ]);


});