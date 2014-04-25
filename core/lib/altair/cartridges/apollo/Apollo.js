/**
 * Sets up Apollo for altair. We also add our self to the Nexus cartridge if it's enabled
 */
define(['altair/facades/declare',
        'dojo/_base/lang',
        '../_Base',
        'dojo/Deferred',
        'apollo/Apollo',
        'require',
        'apollo/Schema'
],

        function (declare,
              lang,
              _Base,
              Deferred,
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

                var _options = options || this.options;

                //do they pass the fieldtypes they want loaded?
                if( !_options.hasOwnProperty('propertyTypes') ) {

                //} else { //jsLint complains about the empty if block, flip it and use this else when you want to do some logic here.

                    //the base fieldtypes i think we need to get altair to work
                    _options.propertyTypes = [
                        'apollo/propertytypes/Str',
                        'apollo/propertytypes/Bool',
                        'apollo/propertytypes/Int',
                        'apollo/propertytypes/Float',
                        'apollo/propertytypes/Date',
                        'apollo/propertytypes/Select',
                        'apollo/propertytypes/Path',
                    ];

                }

                this.deferred   = new Deferred();
                this.apollo     = new Apollo();

                require( _options.propertyTypes, lang.hitch(this, function () {

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
