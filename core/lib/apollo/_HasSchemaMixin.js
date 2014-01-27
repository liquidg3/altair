/**
 * Apollo
 */
define(['dojo/_base/declare',
        'dojo/Deferred',
        'dojo/_base/lang',
        './Schema'
], function (declare,
             Deferred,
             lang,
             Schema) {


    return declare('apollo/_HasSchemaMixin', null, {

        schemaPath: 'config/schema.json',
        schema:     null,
        values:     null,

        /**
         * Load your schema
         */
        constructor: function (schema) {

            if(schema && schema.isInstanceOf(Schema)) {
                this.schema = schema;
            }
        },

        get: function (name, defaultValue, options, config) {



        },

        set: function (name, value) {

        }

    });
});
