/**
 * Gives every module a config(named) method so other people can easily get configs
 */
define(['altair/facades/declare',
        'altair/Deferred',
        './_Base',
        'require',
        'altair/facades/hitch'],

    function (declare,
              Deferred,
              _Base,
              require,
              hitch) {

    return declare([_Base], {

        name: 'config',
        startup: function () {

            if(!this.cartridge.hasExtension('paths')) {
                this.deferred = new Deferred();
                this.deferred.reject(new Error('The config extension needs the paths extension to work.'));
            }

            return this.inherited(arguments);

        },

        /**
         * Extend the Module
         *
         * @param module
         * @returns {*}
         */
        extend: function (Module) {

            Module.extendOnce({

                _configs: null,

                /**
                 * Loads you a config by name, relative to the module's dir
                 *
                 * @returns {altair.Deferred}
                 */
                parseConfig: function (named) {

                    var deferred = new Deferred(),
                        path;

                    if(!this._configs) {
                        this._configs = {};
                    }

                    if( this._configs.hasOwnProperty( 'named' ) ) {

                        deferred.resolve( this._configs[named] );

                    } else {

                        path = this.resolvePath( named );

                        try {

                            require( ['altair/plugins/config!' + path], hitch( this, function ( config ) {

                                if(config === undefined) {

                                    deferred.reject( new Error('Could not read ' + path), false );
                                    this._configs[named] = config;

                                } else {

                                    deferred.resolve( config );

                                }

                            }));

                        } catch (e) {

                            if(this.log) {
                                this.log(e);
                            }

                            deferred.reject( e, false ); //reject and suppress error logging
                        }


                    }

                    return deferred;
                }

            });

            return this.inherited(arguments);
        }

    });


});