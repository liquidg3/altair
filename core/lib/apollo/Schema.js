/**
 * Apollo schemas are meant to be VERY lightweight.
 *
 * In altair
 *
 * var schema = this.nexus('cartridges/Apollo').createSchema({
 *  'elements' => {
 *      'fieldName' => {
 *          'type' => 'string',
 *          'options' => [
 *              'label'         => 'My cool field',
 *              'description'   => 'What the eff dude?',
 *              'required'      => true
 *          ]
 *      }
 * });
 *
 */
define(['dojo/_base/declare',
        'dojo/_base/lang'

], function (declare, lang) {

    return declare(null, {

        _data:           null,
        _elementTypes:   null,
        _optionsByField: null,
        _typeCache:      null,

        /**
         * Pass through straight config... assume its setup how we like it.
         *
         * @param schema
         */
        constructor: function (schema, elementTypes) {

            if (!schema || !elementTypes) {
                throw "You must pass a schema literal and an array of apollo/fieldtypes/_Base instances";
            }

            this._elementTypes      = {};
            this._data              = schema;
            this._optionsByField    = {};
            this._typeCache         = {};

            if(!this._data.elements) {
                this._data.elements = {};
            }

            if (elementTypes instanceof Array) {

                elementTypes.forEach(lang.hitch(this, function (type) {
                    this._elementTypes[type.key] = type;
                }));

            } else {
                this._elementTypes = elementTypes;
            }


        },

        /**
         * Does a schema have a field by this name?
         *
         * @param elementName
         * @returns {boolean}
         */
        has: function (elementName) {

            return (this._data.elements.hasOwnProperty(elementName));
        },

        /**
         * Get you all the options for this field mixed in with all options for the field type.
         *
         * @param elementName
         * @param mixinAll optional
         * @returns {} all options for that field type
         */
        optionsFor: function (elementName, mixinAll) {

            if (elementName in this._data.elements) {

                var element = this._data.elements[elementName],
                    options = element.options;

                if (!options) {
                    throw elementName + " has no options. add it to your schema";
                }

                //if we are doing a simple (lightweight) get of options
                if (mixinAll === false) {
                    return options;
                }

                if (!this._optionsByField[elementName]) {

                    var type = this.elementType(element.type);
                    this._optionsByField[elementName] = type.normalizeOptions(options);

                }


            } else {

                throw elementName + ' does not exist on ' + this.declaredClass;
            }

            return this._optionsByField[elementName];

        },


        /**
         * All the elements on this schema
         *
         * @returns {};
         */
        elements: function () {
            return this._data.elements;
        },

        /**
         * Gets all elements in this schema, but returns an array
         *
         * @returns {Array}
         */
        elementsAsArray: function () {

            var elements = [];

            Object.keys(this._data.elements).forEach(lang.hitch(this, function (name) {

                var element = lang.mixin({}, this._data.elements[name], {
                    name: name
                });

                elements.push(element);

            }));

            return elements;

        },

        /**
         * Returns you a elementtype by a particular key, e.g. string, email, bool
         *
         * @param key
         * @returns {*}
         */
        elementType: function (key) {

            if (!(key in this._elementTypes)) {
                throw 'No field type of ' + key + ' found in schema.';
            }

            return this._elementTypes[key];

        },

        /**
         * Tries all the methods passed on the element elementType, first one wins.
         *
         * Example:
         *
         *  schema.applyOnElement(['toSolrValue', 'toStringValue'], 'firstName', 'Taylo®™', { maxLength: 35 }
         *
         * @param named
         * @returns {*}
         */
        applyOnElement: function (methodNames, elementName, value, options, config) {

            //by convention, these are null and will not be casted
            if (value === null || value === undefined) {
                return null;
            }

            var element = this._data.elements[elementName],
                type = element.type,
                elementType = this.elementType(type),
                c,
                methodName;


            //normalize options
            options = elementType.normalizeOptions(options || {});

            //normalize for many
            value = elementType.normalizeMany(value, options, config);


            for (c = 0; c < methodNames.length; c++) {

                methodName = methodNames[c];

                if (methodName in elementType) {

                    //make sure it's not an array when {{methodName}} is called
                    if (elementType.makeValuesSingular) {

                        var wasArray = false;

                        if (value instanceof Array) {

                            wasArray = true;

                        } else {

                            value = [value];

                        }

                        var finalValue = [];

                        value.forEach(function (_value) {
                            finalValue.push(elementType[methodName](_value, options, config));
                        });

                        return wasArray ? finalValue : finalValue[0];

                    }
                    //we want the raw value passed to method name
                    else {

                        return elementType[methodName](value, options, config);

                    }


                }
            }


            throw 'Could not find methods on element named ' + elementName + '.';

        },

        /**
         * Add a new element to this schema.
         *
         * @param name
         * @param type
         * @param options
         */
        append: function (name, type, options) {
            
            this._data.elements[name] = {
                type:       type,
                options:    options
            };

            return this;
        }

    });
});
