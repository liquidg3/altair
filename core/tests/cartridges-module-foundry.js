define(['altair/test',
        'altair/cartridges/module/Foundry',
        'altair/Altair',
        'altair/events/Emitter',
        'altair/Deferred',
        'altair/facades/hitch'],

    function (test,
              Foundry,
              Altair,
              Emitter,
              Deferred,
              hitch) {

    test.register('cartridges-module-foundry', {

        "test can construct a cache cartridge instance": function (t) {

            var altair      = new Altair(),
                foundry     = new Foundry(altair, {});

            t.t(!!foundry, 'Basic instantiation failed.');

        },

        /**
         * Test dependencies, the dependent module (altair:Mock) is passed second to the foundry... when we get the
         * modules back, it should be in front. This could crash hard if it does not work (meaning it may not trigger
         * the failure callback).
         */
        "test can construct forge modules": function (t) {

            var altair      = new Altair(),
                foundry     = new Foundry(altair, {});

            return foundry.build({
                paths: [
                    'core/tests/modules/altair', 'core/tests/modules/_altair'
                ],
                modules: [ "_altair:Mock", "altair:Mock"]
            }).then(function (modules) {
                t.is(modules[0].name, 'altair:Mock', 'Passing modules to foundry did not produce expected results.');
                t.is(modules[1].name, '_altair:Mock', 'Passing modules to foundry did not produce expected results.');
            });

        },

        "test event emitter delegation": function (t) {

            var altair      = new Altair(),
                foundry     = new Foundry(altair, {}),
                deferred    = new Deferred(),
                delegate    = new Emitter(),
                expected    = ['will-forge-module', 'did-forge-module'],
                listener    = function (e) {

                    if(expected.indexOf(e.name) == -1) {
                        deferred.reject('Unknown event fired while forging a module');
                    } else {

                        _.pull(expected, e.name);

                        if(expected.length == 0) {
                            deferred.resolve();
                        }

                    }

            };


            //listen for emissions
            delegate.on('will-forge-module').then(listener);
            delegate.on('did-forge-module').then(listener);

            foundry.build({
                eventDelegate: delegate,
                paths: [
                    'core/tests/modules/altair'
                ],
                modules: [ "altair:Mock"]
            }).then(function (modules) {
                t.is(modules[0].name, 'altair:Mock', 'Passing modules to foundry did not produce expected results.');
            });

            return deferred;

        }

    });


});
