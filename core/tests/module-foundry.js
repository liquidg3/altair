define(['doh/runner',
        'altair/cartridges/module/Foundry',
        'altair/Altair',
        'altair/facades/hitch'],

    function (doh,
              Foundry,
              Altair,
              hitch) {

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
         * Test dependencies, the dependent module (altair:Mock) is passed second to the foundry... when we get the
         * modules back, it should be in front. This could crash hard if it does not work (meaning it may not trigger
         * the failure callback).
         */
        function (t) {

            var altair      = new Altair(),
                foundry     = new Foundry(altair, {}),
                deferred    = new doh.Deferred();

            foundry.build({
                paths: [
                    'core/tests/modules/vendors'
                ],
                modules: [ "_altair:Mock", "altair:Mock"]
            }).then(function (modules) {
                t.is(modules[0].name, 'altair:Mock', 'Passing modules to foundry did not produce expected results.');
                t.is(modules[1].name, '_altair:Mock', 'Passing modules to foundry did not produce expected results.');
                deferred.resolve(true);
            }).otherwise(hitch(deferred, 'reject'));

            return deferred;
        }

    ]);


});
