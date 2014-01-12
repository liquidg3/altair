/**
 *
 */
define(['dojo/_base/declare',
    'dojo/_base/lang'
], function (declare, lang) {


    return declare(null, {
        name: '',
        data: null,

        constructor: function (name, data) {
            this.name = name;
            this.data = data;
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