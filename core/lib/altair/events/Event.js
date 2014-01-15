/**
 * Altair actually passes around Event objects to its listeners. This give
 */
define(['dojo/_base/declare',
    'dojo/_base/lang'
], function (declare, lang) {


    return declare(null, {
        name: '',
        data: null,
        target: null,

        constructor: function (name, data, target) {
            this.name = name;
            this.data = data;
            this.target = target;
        },

        get: function (name, defaultValue) {
            return this.data[name] || defaultValue;
        },

        set: function (name, value) {
            this.data[name] = value;
            return this;
        }


    });
});