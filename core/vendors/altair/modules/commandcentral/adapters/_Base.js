define([
    'dojo/_base/declare',
    'altair/events/Emitter',
    'altair/Lifecycle',
    'altair/facades/mixin',
    'altair/facades/hitch'
        ], function (declare, Emitter, Lifecycle, mixin, hitch) {


    return declare('altair/modules/commandcentral/adapters/_Base', [Emitter, Lifecycle], {

        _styles: null, /** optional styles your terminal adapter can use

        /**
         * Not all adapters will implement a notice feature
         */
        notice: function (msg) {},

        splash: function () {
            throw "This should output a cool logo or background or something for when Altair:CommandCentral boots.";
        },

        writeLine: function(str, options) {
            throw "Must output str and use whatever options you pass it";
        },

        readLine: function(question, options) {
            throw "Must output question, return a deferred, wait for a response, resolve deferred with response. Must take into account options.";
        },

        form: function(elements, options) {
            throw "Must allow user to fill out the form from the elements passed.";
        },

        select: function (question, selectOptions, options) {
            throw "You must output a nice select using the selectOptions passed. Oh yeah, output the question as well.";
        },

        confirm: function(question, options) {
            throw "You must output the question and let the user select yes or no. You must return a deferred.";
        },

        showProgress: function (message) {
            throw "Let the user know something is loading...";
        },

        hideProgress: function () {

        },
        setStyles: function (styles) {
            this._styles = styles;
            return this;
        },

        /**
         * Pass a selector, only basic by #id works for now
         * @param id
         * @returns {*}
         */
        styles: function (selector) {

            var results = {};

            selector.split(',').forEach(hitch(this, function (_selector) {
                _selector = _selector.trim();
                if( _selector in this._styles) {
                    results = mixin(results, this._styles[_selector]);
                }
            }));

            return results;
        }


    });

});
