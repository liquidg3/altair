/**
 * Apollo schemas are meant to be VERY lightweight.
 */
define(['dojo/_base/declare',
    'dojo/Deferred',
    'dojo/_base/lang'
], function (declare, Deferred, lang) {

    return declare('apollo/Schema', null, {

        data: null,

        /**
         * Pass through straight config... assume its setup how we like it.
         *
         * @param schema
         */
        constructor: function (schema) {
            this.data = schema;
        },

        has: function (fieldName) {
            return fieldName in this.data.elements;
        },

        optionsFor: function (fieldName) {
            return this.data.elements[fieldName].options;
        }

    });
});
