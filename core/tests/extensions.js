define(['doh/runner',
        'altair/facades/declare',
        'altair/cartridges/extension/Extension',
        'altair/Altair',
        'dojo/node!path',
        'dojo/node!os',
        'altair/Deferred'
    ],
    function (doh,
              declare,
              ExtensionCartridge,
              Altair,
              path,
              os,
              Deferred) {


        //helper to load the extensions cartridge seperately from altair
        var loadExtensions = function (extensions) {

            var deferred    = new Deferred(),
                altair      = new Altair(),
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
                    var dummy1 = new declare(null, {
                        dir: os.tmpdir()
                    })();

                    extensions.extend(dummy1);

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

                    var dummy1 = new declare(null, {
                        dir: 'core/tests'
                    })();

                    extensions.extend(dummy1);

                    doh.assertTrue(!!dummy1.parseConfig, 'parseConfig not added to module by Config plugin.');

                    dummy1.parseConfig('config/test').then(function (config) {
                        doh.assertEqual('bar', config.foo, 'Config loading failed');
                    });


                });

            }


        });


    });