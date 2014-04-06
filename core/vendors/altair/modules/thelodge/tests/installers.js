define(['doh/runner',
        'altair/StateMachine',
        'altair/Deferred',
        'core/tests/support/boot',
        'altair/facades/hitch',
        'altair/plugins/config!core/vendors/altair/modules/thelodge/tests/config/cartridges', //altair/modules is not aliased in tests
        'altair/plugins/config!core/vendors/altair/modules/thelodge/tests/config/menu'
    ],
    function (doh,
              StateMachine,
              Deferred,
              boot,
              hitch,
              cartridges,
              testMenu) {

        "use strict";

        doh.register('thelodge.installers', {

            "test registered installers": function (t) {

                //boot altair
                return boot.nexus(cartridges).then(function (nexus) {

                    //create a kitchen
                    return nexus('altair:TheLodge').refreshInstallers().then(function (installers) {
                        t.t(!!installers.modules, 'The lodge failed to register the module installer.');
                    });


                });


            }

        });


    });