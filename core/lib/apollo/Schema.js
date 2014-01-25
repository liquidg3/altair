/**
 * Apollo schemas are meant to be VERY lightweight.
 */
define(['dojo/_base/declare',
    'dojo/Deferred',
    'dojo/_base/lang'
], function (declare, Deferred, lang) {

    return declare('apollo/Schema', null, {

        data: null,
        apollo: null,

        /**
         * Pass through straight config... assume its setup how we like it. We also need apollo to get access to all our
         * fieldtypes with house our casting and rendering
         *
         * @param schema
         */
        constructor: function (schema, apollo) {
            this.data = schema;
            this.apollo = apollo;
        },

        has: function (fieldName) {
            return fieldName in this.data.elements;
        }

    });
});
