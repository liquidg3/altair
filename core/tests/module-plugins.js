define(['doh/runner',
        'altair/cartridges/module/Module',
        'altair/Altair',
        'dojo/node!path'],
    function (doh,
              ModuleCartridge,
              Altair,
              path) {


        var loadPlugins = function (plugins) {

            var deferred    = new doh.Deferred(),
                altair      = new Altair(),
                cartridge   = new ModuleCartridge(altair, {
                    paths:      ['altair/cartridges/module/test'],
                    modules:    ['Altair:Mock'],
                    plugins:    plugins
                });

            cartridge.startup().then(function () {

                cartridge.execute().then(function () {

                    deferred.resolve(cartridge);

                });

            });

            return deferred;

        };


        doh.register('module-plugins', [

            /**
             * Test that the Paths plugin attaches the proper functionality
             */
            function () {

                var deferred = new doh.Deferred();

                loadPlugins(['altair/cartridges/module/plugins/Paths']).then(deferred.getTestCallback(function (cartridge) {

                    var module = cartridge.modules[0];

                    doh.assertTrue(!!module.resolvePath, 'Resolve path not added to module by Paths plugin.');
                    doh.assertEqual(module.resolvePath('public/js/test.js'), path.join(module.dir, 'public', 'js', 'test.js'), 'resolvePpath failed');

                }));

                return deferred;


            }

        ]);


    });