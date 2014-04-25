/**
 * Altair actually passes around Event objects to its listeners. This give
 */
define(['altair/facades/declare',
        'lodash'
], function (declare, _) {


    return declare(null, {
        name:       '',
        data:       null,
        target:     null,
        _results:   null, //whenever an event is emitter, returnd values from callbacks is stored here

        constructor: function (name, data, target) {
            this.name = name;
            this.data = data || {};
            this.target = target;
        },

        get: function (name, defaultValue) {
            return this.data[name] || defaultValue;
        },

        set: function (name, value) {
            this.data[name] = value;
            return this;
        },

        wait: function (timeout) {

        },

        setResults: function (results) {
            this._results = results;
        },

        results: function () {
            return _.flatten(this._results);
        },

        resultsRaw: function () {
            return this._results;
        },


    });
});