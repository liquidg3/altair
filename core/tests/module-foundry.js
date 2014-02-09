define(['doh/runner',
        'altair/cartridges/module/Foundry',
        'altair/Altair'],

    function (doh,
              Foundry,
              Altair) {

    doh.register('module-foundry', [

        /**
         * Make sure we can construct a cache cartridge instance
         */
        function () {

            var altair      = new Altair(),
                foundry     = new Foundry(altair, {});

            doh.assertTrue(!!foundry, 'Basic instantiation failed.');

        },

        /**
         * Test dependencies, the dependent module (Altair:Mock) is passed second to the foundry... when we get the
         * modules back, it should be in front. This could crash hard if it does not work (meaning it may not trigger
         * the failure callback).
         */
        function () {

            var altair      = new Altair(),
                foundry     = new Foundry(altair, {}),
                deferred    = new doh.Deferred();

            foundry.build({
                paths: [
                    'core/tests/modules/vendors'
                ],
                modules: [ "_altair:Mock", "Altair:Mock"]
            }).then(deferred.getTestCallback(function (modules) {
                doh.assertEqual('Altair:Mock', modules[0].name, 'Passing modules to foundry did not produce expected results.');
                doh.assertEqual('_altair:Mock', modules[1].name, 'Passing modules to foundry did not produce expected results.');
            })).otherwise(function (err) {
                doh.reject(err);
            });

            return deferred;
        }

    ]);


});