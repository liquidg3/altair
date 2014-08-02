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
        _results:   null, //whenever an event is emitter, returned values from callbacks is stored here
        active:     true,

        constructor: function (name, data, target) {
            this.name = name;
            this.data = data || {};
            this.target = target;
        },

        get: function (name, defaultValue) {
            return _.has(this.data, name) ? this.data[name] : defaultValue;
        },

        set: function (name, value) {
            this.data[name] = value;
            return this;
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

        preventDefault: function () {
            this.active = false;
        }


    });
});