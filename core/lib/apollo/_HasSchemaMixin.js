/**
 * Apollo _HasSchemaMixin -> give any object you want a schema, it's powerful and stuff =)
 */
define(['dojo/_base/declare',
        'dojo/_base/lang',
        './Schema'
], function (declare,
             lang,
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


    var _HasSchemaMixin = declare('apollo/_HasSchemaMixin', null, {

        schemaPath: 'config/schema.json',
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
        mixin: function(values) {

            Object.keys(values).forEach(lang.hitch(this, function (name) {
                this.set(name, values[name]);
            }));

            return this;
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

            if( this.values.hasOwnProperty( name ) ) {
                this.values[name] = value;

            } else {
                throw "No element called '" + name + "' exists on this " + this.declaredClass;

            }

            return this;
        },

        /**
         * Last resort getter
         *
         * @param name
         * @param defaultValue
         * @param options
         * @param config
         * @returns {*}
         * @private
         */
        _get: function (name, defaultValue, options, config) {

            var value = this._schema.applyOnElement(['toJsValue'], name, this.values[name], options, config);

            if( value === null || value === undefined ) {
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

            var elements    = schema.elements();

            Object.keys(elements).forEach(lang.hitch(this, function (name) {

                //only set values on ourselves that do not already exist
                //this is to ensure that values has a key for every element in the schema
                if( !( this.values.hasOwnProperty(name) ) ) {

                    this.values[name] = '';//so the .set doesn't give us "element does not exist"
                    this.set(name, schema.optionsFor(name, false).value || null);

                }

            }));

            return this;
        }

    });

    return _HasSchemaMixin;
});
