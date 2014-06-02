/**
 * Apollo is a unique ORM. It does not couple itself to any particular type of class, such as a data model or an entity.
 * Schemas in Apollo are strict... very strict. This is to ensure that any schema has everything it needs to be rendered
 * via a UI. Field options like "label" come in handy, even via cli and the "description"
 * attribute is a great place for user friendly documentation (that engineers will appreciate too).
 */
define(['dojo/_base/declare',
        'dojo/Deferred',
        'dojo/_base/lang',
        './Schema'
], function (declare,
             Deferred,
             lang,
             Schema) {


    return declare('apollo/Apollo', null, {

        propertyTypes: null,

        constructor: function (propertyTypes) {
            this.propertyTypes = {};

            if(propertyTypes) {
                this.addTypes(propertyTypes);
            }

        },

        /**
         * Add a new type of property
         * @param fieldType {apollo.propertyTypes._Base}
         * @returns {apollo.Apollo}
         */
        addType: function (propertyType) {
            this.propertyTypes[propertyType.key] = propertyType;
            return this;
        },

        /**
         * Add many property types at once.
         *
         * @param types
         */
        addTypes: function (types) {
            types.forEach(lang.hitch(this, function (type) {
                this.addType(type);
            }));
        },

        /**
         * Get you a property type by key
         *
         * @param type
         * @returns {*}
         */
        type: function (key) {
            return this.propertyTypes[key];
        },

        /**
         * Creates a schema based on the data you provide, but uses the field types that have been added to Apollo
         *
         * @param data
         * @returns {altair.io.core.lib.apollo.Schema}
         */
        createSchema: function (data) {

            var s = new Schema(data, this.propertyTypes);

            return s;

        }


    });
});
