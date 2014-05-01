/**
 * Sets up Apollo for altair. We also add our self to the Nexus cartridge if it's enabled
 */
define(['altair/facades/declare',
        'dojo/_base/lang',
        '../_Base',
        'apollo/Apollo',
        'require',
        'apollo/Schema'
],

        function (declare,
              lang,
              _Base,
              Apollo,
              require,
              Schema) {

        return declare([_Base], {

            name:   'apollo',
            apollo: null,

            /**
             * During startup, setup all the field types
             * @param options
             * @returns {*}
             */
            startup: function (options) {

                var _options = options || this.options || {},
                    types    = _options.propertyTypes || [
                        'apollo/propertytypes/Str',
                        'apollo/propertytypes/Bool',
                        'apollo/propertytypes/Int',
                        'apollo/propertytypes/Float',
                        'apollo/propertytypes/Date',
                        'apollo/propertytypes/Select',
                        'apollo/propertytypes/Path'
                    ];


                this.deferred   = new this.Deferred();
                this.apollo     = new Apollo();

                require( types, this.hitch(function () {

                    var types = Array.prototype.slice.call(arguments),
                        i,
                        type;

                    for( i = 0; i < types.length; i++ ) {
                        type = new types[i]();
                        this.apollo.addType( type );
                    }

                    this.deferred.resolve( this );

                }));

                return this.inherited( arguments );

            },

            /**
             * Create a schema passed on a few options.
             *
             * @param data
             * @returns {*}
             */
            createSchema: function (data) {

                //if they pass a schema, pass it back
                if(data.isInstanceOf && data.isInstanceOf(Schema)) {
                    return data;
                }

                //if they did not pass something with "properties", assume they meant to and that they passed
                //an object where the keys are the property names and everything else is as expected
                if(!data.hasOwnProperty('properties')) {
                    data = {
                        properties: data
                    };
                }

                return this.apollo.createSchema(data);

            }

        });


    });
