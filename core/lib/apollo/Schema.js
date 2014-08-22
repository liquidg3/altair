/**
 * Apollo schemas are meant to be VERY lightweight.
 *
 * In altair
 *
 * var schema = this.nexus('cartridges/Apollo').createSchema({
 *  'properties' => {
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
        'dojo/_base/lang',
        'dojo/Deferred',
        'dojo/promise/all',
        'lodash'

], function (declare, lang, Deferred, all, _) {

    "use strict";

    return declare(null, {

        _data:           null,
        _propertyTypes:   null,
        _optionsByField: null,
        _typeCache:      null,

        /**
         * Pass through straight config... assume its setup how we like it.
         *
         * @param schema
         */
        constructor: function (schema, propertyTypes) {

            if (!schema || !propertyTypes) {
                throw "You must pass a schema literal and an array of apollo/fieldtypes/_Base instances";
            }

            this._propertyTypes      = {};
            this._data              = schema;
            this._optionsByField    = {};
            this._typeCache         = {};

            if(!this._data.properties) {
                this._data.properties = {};
            }

            //make sure each property has a name in it as well
            _.each(this._data.properties, function (prop, name) {
                prop.name = name;
            });

            if (propertyTypes instanceof Array) {

                propertyTypes.forEach(lang.hitch(this, function (type) {
                    this._propertyTypes[type.key] = type;
                }));

            } else {
                this._propertyTypes = propertyTypes;
            }


        },

        /**
         * Does a schema have a field by this name?
         *
         * @param propertyName
         * @returns {boolean}
         */
        has: function (propertyName) {
            return (this._data.properties.hasOwnProperty(propertyName));
        },

        /**
         * Tells you the type of a particular property (firstName would return string)
         *
         * @param propertyName
         * @returns {string}
         */
        typeFor: function (propertyName) {
            return this._data.properties[propertyName].type;
        },

        /**
         * Set a single option for a property
         *
         * @param propertyName
         * @param optionName
         * @param optionValue
         * @returns {this}
         */
        setOptionFor: function (propertyName, optionName, optionValue) {
            if(!this.has(propertyName)) {
                throw new Error('No property named ' + propertyName + ' exists on schema ');
            }
            this._data.properties[propertyName].options[optionName] = optionValue;
            return this;
        },

        /**
         * A property by a particular name
         *
         * @param named
         * @returns {{}}
         */
        property: function (named) {
            return this._data.properties[named];
        },

        /**
         * I single option for a property
         *
         * @param propertyName
         * @param optionName
         * @returns {*}
         */
        optionFor: function (propertyName, optionName) {

            if(!_.has(this._data.properties, propertyName)) {
                throw new Error('no property called ' + propertyName + ' found on schema.');
            }

            return this._data.properties[propertyName].options[optionName];
        },
        /**
         * Get you all the options for this field mixed in with all options for the field type.
         *
         * @param propertyName
         * @param mixinAll optional
         * @returns {string} all options for that field type
         */
        optionsFor: function (propertyName, mixinAll) {

            if (propertyName in this._data.properties) {

                var property = this._data.properties[propertyName],
                    options = property.options;

                if (!options) {
                    throw new Error(propertyName + " has no options. add it to your schema");
                }

                //if we are doing a simple (lightweight) get of options
                if (mixinAll === false) {
                    return options;
                }

                if (!this._optionsByField[propertyName]) {

                    var type = this.propertyType(property.type);
                    this._optionsByField[propertyName] = type.normalizeOptions(options);

                }


            } else {

                throw new Error(propertyName + ' does not exist on ' + this.declaredClass);
            }

            return this._optionsByField[propertyName];

        },

        option: function (named) {
            return this._data[named];
        },

        data: function () {
            return this._data;
        },

        primaryProperty: function () {
            return _.where(this._data.properties, { type: 'primary' }).pop();
        },

        /**
         * All the properties on this schema
         *
         * @returns {};
         */
        properties: function () {
            return this.option('properties');
        },

        /**
         * Gets all properties in this schema, but returns an array
         *
         * @returns {Array}
         */
        propertiesAsArray: function () {

            var properties = [];

            Object.keys(this._data.properties).forEach(lang.hitch(this, function (name) {

                var property = lang.mixin({}, this._data.properties[name], {
                    name: name
                });

                properties.push(property);

            }));

            return properties;

        },

        /**
         * Returns you a propertytype by a particular key, e.g. string, email, bool
         *
         * @param key
         * @returns {*}
         */
        propertyType: function (key) {

            if (!(key in this._propertyTypes)) {
                throw new Error('No property type of ' + key + ' found in schema.');
            }

            return this._propertyTypes[key];

        },

        /**
         * Apply a transformation strategy on many values at once (the keys of values must match a property in the schema)
         *
         * @param values
         * @param optionsByProperty
         * @param config
         * @returns {*}
         */
        applyOnValues: function (values, optionsByProperty, config) {

            var _obp     = optionsByProperty || {},
                _config  = config || {};

            _.each(values, function (value, name) {
                values[name] = this.applyOnProperty(_config.methods || ['toJsValue'], name, value, _obp[name], _config);
            }, this);


            return values;

        },

        /**
         * Tries all the methods passed on the property propertyType, first one wins.
         *
         * Example:
         *
         *  schema.applyOnProperty(['toSolrValue', 'toStringValue'], 'firstName', 'Taylo®™', { maxLength: 35 });
         *
         * @param named
         * @returns {*}
         */
        applyOnProperty: function (methodNames, propertyName, value, options, config) {

            var property = this._data.properties[propertyName],
                type = property.type,
                _config = config || {},
                propertyType = this.propertyType(type),
                c,
                methodName;

            //by convention, these are null and will not be casted
            if ((value === null || value === undefined) && _config.ignoreNull !== false) {
                return null;
            }

            //normalize options
            options = lang.mixin({}, this.optionsFor(propertyName), options || {});

            //normalize for many
            value = propertyType.normalizeMany(value, options, config);


            for (c = 0; c < methodNames.length; c++) {

                methodName = methodNames[c];

                if (_.isFunction(propertyType[methodName])) {

                    //make sure it's not an array when {{methodName}} is called
                    if (propertyType.makeValuesSingular) {

                        var wasArray = false;

                        if (value instanceof Array) {

                            wasArray = true;

                        } else {

                            value = [value];

                        }

                        var finalValue = [];

                        value.forEach(function (_value) {
                            finalValue.push(propertyType[methodName](_value, options, config));
                        });

                        return wasArray ? finalValue : finalValue[0];

                    }
                    //we want the raw value passed to method name
                    else {

                        return propertyType[methodName](value, options, config);

                    }
                }
            }

            throw 'Could not find methods (' + methodNames.join(', ') + ') for property named "' + propertyName + '" of type "' + type + '".';

        },

        /**
         * Add a new property to this schema.
         *
         * @param name
         * @param type
         * @param options
         */
        append: function (name, type, options) {
            
            this._data.properties[name] = {
                type:       type,
                name:       name,
                options:    options
            };

            return this;
        },

        /**
         * Helpful printing
         * @returns {string}
         */
        toString: function () {
            return '[object Schema]';
        },

        /**
         * Validates all the values passed against our properties. Missing fields are also validaded with a value of null.
         *
         * schema().validate().then(... passs ...).otherwise(function (errs) {
         *      console.log('you have', errs.length, 'errors'); //outputs 'you have 6 errors'
         *      console.log('more details', errs.byProperty); //outputs `{ firstName: [...all errors...], email: [...all errors...] }
         * });
         *
         * If no error occured, it will not be include in errs.byProperty.
         *
         * @param values the keys should match properties on this schema
         * @param options { throwOnFirst: false, skipMissing: false } //should i return all errors, or just throw a new Error on first? - should i skip fields you did not pass?
         * @returns {*|Promise}
         */
        validate: function (values, options) {

            var everything  = {},
                errors      = [],
                errorsByProp = {},
                _options    = options || {},
                dfd         = new Deferred(),
                skipMissing  = _.has(_options, 'skipMissing') ? _options.skipMissing : false,
                _values     = values || {};

            //call validate on all properties
            _.each(this.properties(), function (prop, key) {

                //mantain keys for all validate() calls
                if(!skipMissing || _.has(values, key)) {
                    everything[key] = this.applyOnProperty(['validate'], key, _values[key] || null, {}, { ignoreNull: false });
                }

            }, this);


            //when all are done validating, check results for arrays (a result of true is pass, an array is fail)
            all(everything).then(function (results) {

                _.each(results, function (result, key) {

                    //anything with many: true will be
                    var many = this.optionFor(key, 'many'),
                        manyResults = many ? result : [result];


                    _.each(manyResults, function (result) {

                        //if the result of validate() is not true, it's an array of errors
                        if(result !== true) {

                            if(!_.isArray(result)) {
                                throw new Error('validate() for property type ' +  this.typeFor(key) + ' must return `true` or an array.');
                            }

                            if(_options.throwOnFirst) {
                                throw new Error(result[0]);
                            }

                            errors = errors.concat(result);
                            if (!errorsByProp[key]) {
                                errorsByProp[key] = [];
                            }
                            errorsByProp[key] = errorsByProp[key].concat(result);
                        }

                    });

                }, this);

                if( errors.length > 0 ) {
                    errors.byProperty = errorsByProp;
                    dfd.reject(errors);
                    return;
                }

                dfd.resolve(true);


            }.bind(this)).otherwise(function (err) {
                dfd.reject(err);
            });

            return dfd;

        }

    });
});
