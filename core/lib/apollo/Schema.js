/**
 * Apollo schemas are meant to be VERY lightweight.
 */
define(['dojo/_base/declare',
    'dojo/_base/lang'
], function (declare, lang) {

    return declare('apollo/Schema', null, {

        data:           null,
        fieldTypes:     null,
        optionsByField: null,
        typeCache:      null,

        /**
         * Pass through straight config... assume its setup how we like it.
         *
         * @param schema
         */
        constructor: function (schema, fieldTypes) {

            if (!schema || !fieldTypes) {
                throw "You must pass a schema literal and an array of apollo/fieldtypes/_Base instances";
            }

            this.fieldTypes     = {};
            this.data           = schema;
            this.optionsByField = {};
            this.typeCache      = {};

            if(fieldTypes instanceof Array) {

                fieldTypes.forEach(lang.hitch(this, function (type) {
                    this.fieldTypes[type.key] = type;
                }));
            } else {
                this.fieldTypes = fieldTypes;
            }


        },

        /**
         * Does a schema have a field by this name?
         *
         * @param fieldName
         * @returns {boolean}
         */
        has: function (fieldName) {
            return fieldName in this.data.elements;
        },

        /**
         * Get you all the options for this field mixed in with all options for the field type.
         *
         * @param fieldName
         * @param mixinAll optional
         * @returns {} all options for that field type
         */
        optionsFor: function (fieldName, mixinAll) {

            if(fieldName in this.data.elements) {

                var element = this.data.elements[fieldName],
                    options = element.options;

                //if we are doing a simple (lightweight) get of options
                if(mixinAll === false) {
                    return options;
                }

                if(!this.optionsByField[fieldName]) {

                    var type = this.fieldType(element.type);
                    this.optionsByField[fieldName]  = type.normalizeOptions(options);

                }


            } else {

                throw fieldName + ' does not exist on ' + this.declaredClass;
            }



            return this.optionsByField[fieldName];
        },


        /**
         * All the elements on this schema
         *
         * @returns [];
         */
        elements: function () {
            return this.data.elements;
        },

        /**
         * Returns you a field by a particular type
         *
         * @param key
         * @returns {*}
         */
        fieldType: function (key) {

            if(!(key in this.fieldTypes)) {
                throw 'No field type of ' + key + ' found in schema.';
            }

            return this.fieldTypes[key];

        },

        /**
         * Tries all the methods passed on the element fieldType, first one wins.
         *
         * Example:
         *
         *
         *  schema.applyOnElement(['toSolrValue', 'toStringValue'], 'firstName', 'Taylo®™', { maxLength: 35 }
         *
         * @param named
         * @returns {*}
         */
        applyOnElement: function (methodNames, elementName, value, options, config) {

            //by convention, these are null and will not be casted
            if(value === null || value === undefined) {
                return null;
            }

            var element     = this.data.elements[elementName],
                type        = element.type,
                fieldType   = this.fieldType(type),
                c,
                methodName;


            //normalize options
            options = fieldType.normalizeOptions(options || {});

            //normalize for many
            value   = fieldType.normalizeMany(value, options, config);


            for(c = 0; c < methodNames.length; c++) {

                methodName = methodNames[c];

                if(methodName in fieldType) {

                    //make sure it's not an array when {{methodName}} is called
                    if(fieldType.makeValuesSingular) {

                        var wasArray = false;

                        if(value instanceof Array) {

                            wasArray = true;

                        } else {

                            value = [value];

                        }

                        var finalValue = [];

                        value.forEach(function (_value) {
                            finalValue.push(fieldType[methodName](_value, options, config));
                        });

                        return wasArray ? finalValue : finalValue[0];


                    }
                    //we want the raw value passed to method name
                    else {

                        return fieldType[methodName](value, options, config);

                    }



                }
            }


            throw 'Could not find methods on element named ' + elementName + '.';

        }

    });
});
