/**
 * Apollo _HasSchemaMixin -> give any object you want a schema, it's powerful and stuff =)
 */
define(['dojo/_base/declare',
        'lodash',
        'dojo/Deferred',
        'dojo/promise/all',
        './Schema'
], function (declare,
             _,
             Deferred,
             all,
             Schema) {

    function capitalise(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function toGetter(named) {
        return 'get' + capitalise(named);
    }

    function toSetter(named) {
        return 'set' + capitalise(named);
    }


    var _HasSchemaMixin = declare(null, {

        _schema:    null,
        values:     null,

        /**
         * Pass a schema if ya'nt
         *
         * @param schema
         */
        constructor: function (schema) {

            if(schema && schema.isInstanceOf && schema.isInstanceOf(Schema)) {
                this.setSchema(schema);
            }

        },

        /**
         * Will try and call an method to override this getter (getFieldName).
         *
         * @param name
         * @param defaultValue
         * @param options
         * @param config
         * @returns {*}
         */
        get: function (name, defaultValue, options, config) {

            var methodName = toGetter(name);

            if( typeof this[methodName] === 'function') {
                return this[methodName](defaultValue, options, config);
            }

            return this._get(name, defaultValue, options, config);

        },

        /**
         * Will try and call an overridden setter first, then
         *
         * @param name
         * @param value
         * @returns {apollo|_HasSchemaMixin}
         */
        set: function (name, value) {

            var methodName = toSetter(name),
                results;

            if( typeof this[methodName] === 'function') {

                results = this[methodName](value);

            } else {

                results = this._set(name, value);
            }

            return results;
        },

        /**
         * Mixes in only matching values, leaving the rest
         *
         * @param values
         * @returns {_HasSchemaMixin}
         */
        mixin: function(values, optionsByField, config) {

            var cleaned = {};

            _.each(values, function (value, name) {
                if(this.has(name)) {

                    if(config && config.methods) {

                        var options = optionsByField && optionsByField[name] || {};

                        //pass through old value
                        config.old = this.values[name];

                        //apply methods on value
                        cleaned[name] = this.schema().applyOnProperty(config.methods, name, value, options, config);

                    } else {
                        cleaned[name] = value;
                    }
                }
            }, this);

            if(config && config.methods) {

                return all(cleaned).then(function (values) {

                    _.each(values, function (value, name) {
                        this.set(name, value);
                    }, this);

                    return this;

                }.bind(this));

            } else {

                _.each(cleaned, function (value, name) {
                    this.set(name, value);
                }, this);

                return this;

            }

        },

        has: function (name) {
            return this.schema().has(name);
        },

        /**
         * Default setter, just sets values array
         *
         * @param name
         * @param value
         * @returns {apollo|_HasSchemaMixin}
         * @private
         */
        _set: function (name, value) {

            if( this.schema().has( name ) ) {
                this.values[name] = value;

            } else {
                throw new Error("No property called '" + name + "' exists on this " + this);

            }

            return this;
        },

        /**
         * Last resort getter. If you override a getter and still want access to the original value in the schema
         *
         * @param name
         * @param defaultValue
         * @param options
         * @param config
         * @returns {*}
         * @private
         */
        _get: function (name, defaultValue, options, config) {

            if (!_.has(this.values, name)) {
                throw new Error('No property ' + name + ' found on ' + this);
            }

            var value = this.schema().applyOnProperty((config && config.methods) ? config.methods : ['toJsValue'], name, this.values[name], options, config);

            if( value === null || value === undefined && !_.isUndefined(defaultValue)) {
                value = defaultValue;

            }

            return value;
        },

        /**
         * Set the schema to this object, then set default values to ourselves.
         *
         * @param schema
         * @returns {apollo|_HasSchemaMixin}
         */
        setSchema: function (schema) {

            this._schema    = schema;

            if(!this.values) {
                this.values = {};
            }

            var properties    = schema.properties();

            _.each(properties, function (value, name) {

                //only set values on ourselves that do not already exist
                //this is to ensure that values has a key for every property in the schema
                if( !( this.values.hasOwnProperty(name) ) ) {
                    var defaultValue = schema.optionsFor(name, false).default;
                    this.set(name, defaultValue);
                }

            }, this);

            return this;

        },

        /**
         * Returns you the schema attached to this object
         *
         * @returns {apollo.Schema}
         */
        schema: function () {
            return this._schema;
        },

        /**
         *
         * @returns {*}
         */
        getValues: function (optionsByProperty, config) {

            var values   = {},
                _obp     = optionsByProperty || {},
                _all     = _obp['*'] || {},
                _config  = config || {};

            _.each(this.schema().properties(), function (propConfig, name) {

                if(_obp) {
                    _obp[name] = _.defaults(_obp[name] || {}, _all);
                }

                var options = _.defaults(_obp[name] || {}, propConfig.options);

                values[name] = this.get(name, null, options, _config);


            }, this);


            return values;

        },

        primaryProperty: function () {
            return this.schema().primaryProperty();
        },

        primaryValue: function () {
            var prop = this.primaryProperty();
            return prop ? this.get(prop.name) : undefined;
        },

        /**
         * @TODO finish
         *
         * @returns {dojo.Deferred}
         */
        validate: function (options) {

            var schema = this.schema();

            if(!schema) {
                throw new Error('You can only validate objects that have a schema.');
            }

            return schema.validate(this.values, options).then(function () {
                return this;
            }.bind(this));

        }

    });

    return _HasSchemaMixin;
});
