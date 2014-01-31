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
                    paths:      ['core/tests/modules/vendors'],
                    modules:    ['Altair:Mock'],
                    plugins:    plugins
                });

            cartridge.startup().then(function () {

                cartridge.execute().then(function () {

                    deferred.resolve(cartridge.modules);

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

                loadPlugins(['altair/cartridges/module/plugins/Paths']).then(deferred.getTestCallback(function (modules) {

                    var module = modules[0];

                    doh.assertTrue(!!module.resolvePath, 'Resolve path not added to module by Paths plugin.');
                    doh.assertEqual(module.resolvePath('public/js/test.js'), path.join(module.dir, 'public', 'js', 'test.js'), 'resolvePpath failed');

                }));

                return deferred;


            },

            /**
             * Test the config plugin
             * @returns {dojo.tests._base.Deferred}
             */
            {
                name: 'configPluginTest',
                runTest: function () {

                    var deferred = new doh.Deferred();

                    loadPlugins(['altair/cartridges/module/plugins/Paths', 'altair/cartridges/module/plugins/Config']).then(function (modules) {

                        var module = modules[0];

                        doh.assertTrue(!!module.parseConfig, 'parseConfig not added to module by Config plugin.');

                        module.parseConfig('config/test.json').then(function (config) {
                            doh.assertEqual('bar', config.foo, 'Config loading failed');
                        });

                        deferred.resolve(true);

                    });

                    return deferred;

                }
            }


        ]);


    });