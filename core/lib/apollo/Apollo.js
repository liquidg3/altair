/**
 * Apollo is a unique ORM. It does not couple itself to any particular type of class, such as a data model or an entity.
 * Schemas in Apollo are strict... very strict. This is to ensure that any schema has everything it needs to be rendered
 * via a UI. Field options like "label" come in handy, even via cli and the "description"
 * attribute is a great place for user friendly documentation (that engineers will appreciate too).
 */
define(['dojo/_base/declare',
        'dojo/Deferred',
        'dojo/_base/lang'
], function (declare, Deferred, lang) {


    return declare('apollo/Apollo', null, {


        registerType: function (key, type) {

        }


    });
});
