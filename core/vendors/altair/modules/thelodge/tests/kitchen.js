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

        doh.register('thelodge.kitchen', {

            "test searching the kitchen with local menu": function (t) {

                //boot altair
                return boot.nexus(cartridges).then(function (nexus) {

                    //create a kitchen
                    return nexus('altair:TheLodge').foundry('client/Kitchen', {
                        menus: [ testMenu ]
                    }).then(function (kitchen) {

                        //search the kitchen
                        return kitchen.search('IoT').then(function (results) {

                            t.is(results[0].name, 'liquidfire:Jarvis', 'searching the kitchen failed');

                        });


                    });


                });
                

            }

        });


    });