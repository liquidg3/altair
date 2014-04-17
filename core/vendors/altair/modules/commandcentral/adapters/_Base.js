define([
    'altair/facades/declare',
    'altair/events/Emitter',
    'altair/Lifecycle',
    'altair/facades/mixin',
    'altair/facades/hitch',
    'dojo/_base/lang'
        ],
    function (declare,
              Emitter,
              Lifecycle,
              mixin,
              hitch,
              lang) {


    return declare([Emitter, Lifecycle], {

        _styles:        null, /** optional styles your terminal adapter can use **/
        focused:        null, /** the commander currently in focus **/

        constructor: function () {
            this._styles = {};
        },

        /**
         * Not all adapters will implement a notice feature
         */
        notice: function (msg) {},

        splash: function () {
            throw "This should output a cool logo or background or something for when altair:CommandCentral boots.";
        },

        writeLine: function(str, options) {
            throw "Must output str and use whatever options you pass it";
        },

        writeError: function (err) {
            "use strict";
            //an error occurred, so lets try our best to start again
            if(err instanceof Error) {
                err = err.stack;
            }
            console.error(err);

        },

        readLine: function(question, options) {
            throw "Must output question, return a deferred, wait for a response, resolve deferred with response. Must take into account options.";
        },

        //if we can autoload the current commander, return it here (see ./Prompt)
        initialCommander: function () {
           return null;
        },

        //if we can autoload the current command, return it here
        initialCommand: function () {
            return null;
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

        /**
         * Lets you run some custom visuals when a commander is focused
         *
         * @param commander
         * @returns {altair|modules|commandcentral|adapters|_Base}
         */
        focus: function (commander) {

            if(commander.styles) {
                this.addStyles(commander.name, commander.styles);
            }

            commander.focus();

            return this;
        },

        /**
         * Undo anything focus would have done for this commander
         *
         * @param commander
         */
        blur: function (commander) {

            if(commander.styles) {
                this.removeStyles(commander.name);
            }

            commander.blur();

            return this;
        },

        hideProgress: function () {

        },

        /**
         * Takes the options you pass it and returns an object.
         *
         *
         *
         * @param options
         * @private
         */
        normalizeDefaultAndOptions: function (defaultValue, options) {

            if(!options) {
                options = {};
            }

            if(typeof defaultValue === 'string') {
                options = mixin(options, {
                    default: options
                });
            } else if(!options) {
                options = {};
            }

            return options;

        },

        /**
         * Add in styles by key
         *
         * @param key
         * @param styles
         * @returns {altair|modules|commandcentral|adapters|_Base}
         */
        addStyles: function (key, styles) {
            this._styles[key] = styles;
            return this;
        },

        /**
         * Delete those same styles by key
         * @param key
         * @returns {altair|modules|commandcentral|adapters|_Base}
         */
        removeStyles: function (key) {
            delete this._styles[key];
            return this;
        },

        /**
         * Pass a selector, only basic exact matches with dumb cascading works for now.
         *
         * Note: the order you pass your comma (,) separated selectors is important. They are parsed in the order you
         * pass them in... so previous styles are overwritten by the next.
         *
         * @param selector string that is your css selectors comma separated. only single word selectors are supported.
         * @returns {*}
         */
        styles: function (selector) {

            var results = {};

            if(!lang.isString(selector)) {
                return selector;
            }

            //mixes in *
            selector = '*,' + selector;

            selector.split(',').forEach(hitch(this, function (_selector) {
                _selector = _selector.trim();
                Object.keys(this._styles).forEach(hitch(this, function (key) {
                    if( _selector in this._styles[key]) {
                        results = mixin(results, this._styles[key][_selector]);
                    }
                }));
            }));

            return results;
        }


    });

});
