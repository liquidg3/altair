/**
 * Loads every modules' package.json so it
 */
define(['altair/facades/declare',
        './_Base'],

    function (declare,
              _Base) {

    return declare([_Base], {

        name:    'package',
        _handles: 'module',

        startup: function () {

            if(!this.cartridge.hasExtension('config')) {
                this.deferred = new this.Deferred();
                this.deferred.reject(new Error('The package extension requires the config extension.'));
                return this.inherited(arguments);
            }

            //if the module cartridge is installed, hook into forge
            if(this.altair.hasCartridge('module')) {

                var m = this.altair.cartridge('module');
                m.on('did-forge-module').then(this.hitch('onDidForgeModule'));

            }

            return this.inherited(arguments);

        },

        execute: function (module) {

            //a subcomponent will probably not have packagePath
            if(!module.packagePath) {

                this.deferred = new this.Deferred();
                this.deferred.resolve(this);

            } else {

                this.deferred = module.parseConfig(module.packagePath).then(this.hitch(function (parsedPackage) {

                    declare.safeMixin(module, {
                        package: parsedPackage
                    });

                }));

            }

            return this.inherited(arguments);
        },

        /**
         * Whenever a module is forged, we need to setup the package path
         *
         * @param e
         */
        onDidForgeModule: function (e) {

            var module = e.get('module');

            if(!module.packagePath) {
                module.packagePath = 'package.json';
            }

        }

    });


});