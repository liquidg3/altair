define(['doh/runner',
    'core/tests/support/boot',
    'dojo/Deferred',
    'altair/facades/hitch'],
    function (doh,
              boot,
              Deferred,
              hitch
              ) {


        var styles = {

            "#splash": {
                "width": 100,
                "height": 100
            },

            "select": {
                "width": 75,
                "height": 50
            },

            "#my-select": {
                "width": 150
            }

        },

        cartridges = [
            {
                path: 'altair/cartridges/nexus/Nexus',
                options: {

                }
            },
            {
                path: 'altair/cartridges/apollo/Apollo',
                options: {

                }
            },
            {
                path: 'altair/cartridges/extension/Extension',
                options: {
                    extensions: [
                        "altair/cartridges/extension/extensions/Paths",
                        "altair/cartridges/extension/extensions/Config",
                        "altair/cartridges/extension/extensions/Package",
                        "altair/cartridges/extension/extensions/Deferred",
                        "altair/cartridges/extension/extensions/Apollo",
                        "altair/cartridges/extension/extensions/Nexus",
                        "altair/cartridges/extension/extensions/Events",
                        "altair/cartridges/extension/extensions/Foundry"
                    ]
                }
            },
            {
                path: 'altair/cartridges/module/Module',
                options: {
                    paths: ['core/vendors'],
                    modules: ['altair:Events', 'altair:Adapters', 'altair:CommandCentral' ],
                    moduleOptions: {
                        "altair:CommandCentral": {
                            "autostart": false
                        }
                    }
                }
            }
        ];

        doh.register('command-central', {

            "test parsing selector by tag and id, ensuring cascading": function (t) {

                return boot.nexus(cartridges).then(function (nexus) {

                    var m = nexus('altair:CommandCentral');

                    m.adapter('adapters/Mock').then(function (mock) {

                        mock.addStyles('test', styles);

                        var matches = mock.styles('select, #my-select');
                        t.is(matches, {
                            "width": 150,
                            "height": 50
                        }, 'could not match styles on select, id');

                    });

                });


            },

            "test basic by id": function (t) {

                return boot.nexus(cartridges).then(function (nexus) {

                    var m = nexus('altair:CommandCentral');

                    m.adapter('adapters/Mock').then(function (mock) {

                        mock.addStyles('mock', styles);

                        var matches = mock.styles('#splash');
                        t.is(matches, styles['#splash'], 'could not match styles on basic id match');

                    });

                });


            }



        });


    });