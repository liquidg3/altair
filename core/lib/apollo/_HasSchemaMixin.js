/**
 * Apollo
 */
define(['dojo/_base/declare',
    'dojo/Deferred',
    'dojo/_base/lang'
], function (declare, Deferred, lang) {


    return declare('apollo/_HasSchemaMixin', null, {

        schemaPath: 'config/schema.json',
        apollo:     null,
        values:     null,

        /**
         * Load your schema
         */
        launch: function (schema) {

            var deferred = new Deferred();

            if(schema) {
                this.schema = new Schema(schema, this.apollo);
            }

            return deferred;

        },

        get: function (name, defaultValue, options, config) {



        },

        set: function (name, value) {

        }

    });
});
