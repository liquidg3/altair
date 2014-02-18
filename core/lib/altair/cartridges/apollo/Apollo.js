/**
 * Sets up Apollo for altair. We also add our self to the Nexus cartridge if it's enabled
 */
define(['dojo/_base/declare',
        'dojo/_base/lang',
        '../_Base',
        'dojo/Deferred',
        'apollo/Apollo',
        'require'
],

        function (declare,
              lang,
              _Base,
              Deferred,
              Apollo,
              require) {

        return declare('altair/cartridges/apollo/Apollo', [_Base], {

            apollo: null,

            /**
             * During startup, setup all the field types
             * @param options
             * @returns {*}
             */
            startup: function (options) {

                options = options || this.options;

                //do they pass the fieldtypes they want loaded?
                if('fieldTypes' in options) {

                } else {

                    //the base fieldtypes i think we need to get altair to work
                    options.fieldTypes = [
                        'apollo/fieldtypes/Str',
                        'apollo/fieldtypes/Bool',
                        'apollo/fieldtypes/Int',
                        'apollo/fieldtypes/Float',
                        'apollo/fieldtypes/Date'
                    ];

                }

                this.deferred   = new Deferred;
                this.apollo     = new Apollo();

                require(options.fieldTypes, lang.hitch(this, function () {

                    var types = Array.prototype.slice.call(arguments);

                    for(var i = 0; i < types.length; i ++) {
                        var type = new types[i]();
                        this.apollo.addType(type);
                    }

                    this.deferred.resolve(this);

                }));

                return this.inherited(arguments);

            },

            /**
             * Add ourselves to nexus if it's enabled
             */
            execute: function () {

                if(this.altair.hasCartridge('altair/cartridges/nexus/Nexus')) {

                    var nexus = this.altair.cartridge('altair/cartridges/nexus/Nexus');
                    nexus.set('cartridges/Apollo', this);

                }

                return this.inherited(arguments);
            },

            /**
             * Straight passthrough for createSchema on Apollo
             *
             * @param data
             * @returns {*}
             */
            createSchema: function (data) {
                return this.apollo.createSchema(data);
            }

        });


    });
