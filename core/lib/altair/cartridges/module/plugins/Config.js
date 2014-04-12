/**
 * Gives every module a config(named) method so other people can easily get configs
 */
define(['altair/facades/declare',
        'altair/Deferred',
        './_Base',
        'dojo/_base/lang',
        'require',
        'altair/facades/hitch'],

    function (declare,
              Deferred,
              _Base,
              lang,
              require,
              hitch) {

    return declare([_Base], {

        declaredClass: 'altair/cartridges/module/plugins/Config',
        execute: function (module) {

            //YUCK
            if(!module.resolvePath) {
                this.deferred = new Deferred();
                this.deferred.reject("The Config plugin requires the altair/cartridges/module/plugins/Paths plugin, make sure Paths has been setup.");
                return this.deferred;
            }

            declare.safeMixin(module, {

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