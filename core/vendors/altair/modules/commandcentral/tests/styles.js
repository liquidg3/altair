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

        };

        boot.cartridges = [
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
                path: 'altair/cartridges/module/Module',
                options: {
                    paths: ['core/vendors'],
                    modules: ['Altair:Events', 'Altair:Adapters', 'Altair:CommandCentral' ],
                    moduleOptions: {
                        "Altair:CommandCentral": {
                            "autostart": false
                        }
                    },
                    plugins: [
                        "altair/cartridges/module/plugins/Paths",
                        "altair/cartridges/module/plugins/Config",
                        "altair/cartridges/module/plugins/Package",
                        "altair/cartridges/module/plugins/Deferred",
                        "altair/cartridges/module/plugins/Apollo",
                        "altair/cartridges/module/plugins/Nexus",
                        "altair/cartridges/module/plugins/Events",
                        "altair/cartridges/module/plugins/Foundry"
                    ]
                }
            }
        ]




        doh.register('altair-adapters-module', [


            /**
             * Make sure I can parse a style by selector, id (2nd one wins)
             */
            function (t) {

                return boot().then(function (altair) {

                    var m = altair.cartridge('altair/cartridges/module/Module').module('Altair:CommandCentral');

                    m.adapter('adapters/Mock').then(function (mock) {

                        mock.setStyles(styles);

                        var matches = mock.styles('select, #my-select');
                        t.is(matches, {
                            "width": 150,
                            "height": 50
                        }, 'could not match styles on select, id');

                    });

                });


            },

            function (t) {

                return boot().then(function (altair) {

                    var m = altair.cartridge('altair/cartridges/module/Module').module('Altair:CommandCentral');

                    m.adapter('adapters/Mock').then(function (mock) {

                        mock.setStyles(styles);

                        var matches = mock.styles('#splash');
                        t.is(matches, styles['#splash'], 'could not match styles on basic id match');

                    });

                });


            }



        ]);


    });