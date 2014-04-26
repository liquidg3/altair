define(['doh/runner',
        'altair/facades/declare',
        'altair/cartridges/extension/Extension',
        'altair/Altair',
        'altair/plugins/node!path',
        'altair/plugins/node!os',
        'altair/Deferred',
        'core/tests/support/boot'
    ],
    function (doh,
              declare,
              ExtensionCartridge,
              Altair,
              path,
              os,
              Deferred,
              boot) {

        var cartridges = [
            {
                path: 'altair/cartridges/apollo/Apollo',
                options: {

                }
            },
            {
                path: 'altair/cartridges/nexus/Nexus',
                options: {

                }
            },
            {
                path: 'altair/cartridges/module/Module',
                options: {
                    paths: ['core/tests/modules/vendors'],
                    modules: ['altair:Mock']
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
            }
        ];


        //helper to load the extensions cartridge seperately from altair
        var loadExtensions = function (extensions) {

            var altair      = new Altair(),
                cartridge   = new ExtensionCartridge(altair, {
                    extensions:    extensions
                });

            return cartridge.startup().then(function () {

                return cartridge.execute();

            }).then(function () {

                return cartridge;

            });

        };


        doh.register('extensions', {

            "test paths extension": function (t) {

                return loadExtensions(['altair/cartridges/extension/extensions/Paths']).then(function (extensions) {

                    //dummy classes for extensions
                    var Dummy1 = declare(null, {
                        dir: os.tmpdir()
                    });

                    extensions.extend(Dummy1);

                    var dummy1 = new Dummy1();

                    t.t(!!dummy1.resolvePath, 'Resolve path not added to module by Paths plugin.');
                    t.is(dummy1.resolvePath('public/js/test.js'), path.join(dummy1.dir, 'public', 'js', 'test.js'), 'resolvePath failed');


                });


            },

            /**
             * Test the config plugin
             * @returns {dojo.tests._base.Deferred}
             */
            "test config extension": function (t) {

                return loadExtensions(['altair/cartridges/extension/extensions/Paths', 'altair/cartridges/extension/extensions/Config']).then(function (extensions) {

                    var Dummy1 = declare(null, {
                        dir: 'core/tests'
                    });

                    extensions.extend(Dummy1);

                    var dummy1 = new Dummy1();

                    doh.assertTrue(!!dummy1.parseConfig, 'parseConfig not added to module by Config plugin.');

                    return dummy1.parseConfig('configs/env?env=dev').then(function (config) {
                        t.is('bar2', config.foo, 'Config loading failed');
                    });


                });

            },

            "test no double extend": function (t) {

                return boot.nexus(cartridges).then(function (nexus) {

                    var m = nexus('altair:Mock');


                });

            }


        });


    });