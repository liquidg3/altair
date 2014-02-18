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
        schema:     null,
        values:     null,

        /**
         * Pass a schema if ya'nt
         *
         * @param schema
         */
        constructor: function (schema) {

            if(schema && schema.isInstanceOf && schema.isInstanceOf(Schema)) {
                this.schema = schema;
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

            if(methodName in this) {
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

            var methodName = toSetter(name);

            if(methodName in this) {
                return this[methodName](value);
            } else {
                return this._set(name, value);
            }

        },

        /**
         * Mixes in only matching values, leaving the rest
         *
         * @param values
         * @returns {_HasSchemaMixin}
         */
        mixin: function(values) {

            throw "FINISH";

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

            if(name in this.values) {
                this.values[name] = value;
            } else {
                throw "No field called '" + name + "' exists on this " + this.declaredClass;
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

            if(value === null || typeof value === 'undefined') {
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
                if(name in this.values) {

                } else {
                    this.values[name] = schema.optionsFor(name, false).value || null;
                }
            }));


            return this;
        }

    });

    /**
     * Schema getter/setter
     */
    Object.defineProperty(_HasSchemaMixin.prototype, 'schema', {
        set: function (value) {
            this.setSchema(value);
        },
        get: function () {
            return this._schema;
        }
    });

    return _HasSchemaMixin;
});
