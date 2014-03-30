define(['doh/runner',
        'altair/StateMachine',
        'altair/Deferred',
        'core/tests/support/boot',
        'altair/facades/hitch'
    ],
    function (doh,
              StateMachine,
              Deferred,
              boot,
              hitch) {

        "use strict";

        //boot config
        var cartridges = [
            {
                "path": "altair/cartridges/nexus/Nexus",
                "options": {
                }
            },
            {
                "path": "altair/cartridges/apollo/Apollo",
                "options": {
                }
            },
            {
                "path": "altair/cartridges/module/Module",
                "options": {
                    "plugins": [
                        "altair/cartridges/module/plugins/Paths",
                        "altair/cartridges/module/plugins/Config",
                        "altair/cartridges/module/plugins/Package",
                        "altair/cartridges/module/plugins/Deferred",
                        "altair/cartridges/module/plugins/Apollo",
                        "altair/cartridges/module/plugins/Nexus",
                        "altair/cartridges/module/plugins/Events",
                        "altair/cartridges/module/plugins/Foundry"
                    ],
                    paths:      ['core/vendors'],
                    "modules":  ['altair:Events', 'altair:CommandCentral', 'altair:Adapters', 'altair:TheLodge'],
                    "moduleOptions": {
                        "altair:CommandCentral": {
                            "autostart": false
                        }
                    }
                }
            }
            ],
            testRepo  = {
                type:   'git',
                url:    'git@github.com:liquidg3/altair-test-checkout.git'
            };

        doh.register('thelodge.vcs', {


            "test checkout test git repo": function (t) {

                var d = new Deferred();

                boot.nexus(cartridges).then(function (nexus) {


                    nexus('Altair:TheLodge').vcs('git').then(function (git) {

                        console.log(git);
                        d.resolve();

                    });


                }).otherwise(hitch(d,'reject'));

                return d;
            }


        });


    });