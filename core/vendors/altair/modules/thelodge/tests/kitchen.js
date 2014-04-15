define(['doh/runner',
        'altair/StateMachine',
        'altair/Deferred',
        'core/tests/support/boot',
        'altair/facades/hitch',
        'altair/plugins/config!./configs/cartridges',
        'altair/plugins/config!./configs/menu'
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
                

            },

            "test installing module into community dir": function (t) {

                //boot altair
                return boot.nexus(cartridges).then(function (nexus) {

                    //create a kitchen
                    return nexus('altair:TheLodge').foundry('client/Kitchen', {
                        menus: [ testMenu ]
                    }).then(function (kitchen) {

                        //search the kitchen
                        return kitchen.search('IoT').then(function (results) {

//                            var jarvis =

                            t.is(results[0].name, 'liquidfire:Jarvis', 'searching the kitchen failed');

                            //checkout module
//                            kitchen.vcs(resul)

                        });


                    });

                });


            }

        });


    });