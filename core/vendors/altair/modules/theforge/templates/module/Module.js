/**
 * Freshly forged module ready to go!
 *
 * @author:     **Your name here**
 * @license:    **Your license here**
 * @vendor:     %(vendor)s
 * @module:     %(name)s
 * @nexus:      this.nexus("%(full)s")
 *
 * What next?
 *
 * 1. Setting up listeners: altair.io/docs/listeners.md
 * 2. Using extensions: altair.io/docs/extensions.md
 * 3. Building a Commander: altair.io/core/vendors/altair/modules/commandcentral/README.md
 * 4. The Adapter Pattern:  altair.io/core/vendors/altair/modules/adapters/README.md
 *
 */

define(['altair/facades/declare', //take a look at terms.md
        'altair/Lifecycle',
        'altair/mixins/_AssertMixin',
        'altair/plugins/node!fs',
        'altair/events/Emitter'
], function (declare,
             Lifecycle,
             _AssertMixin,
             fs,
             Emitter) {

    //by mixing in Lifecycle, we get startup(options), execute(options), and shutdown()
    return declare([Lifecycle, Emitter, _AssertMixin], {


        /**
         * Startup is called after every module is instantiated, you can only rely on modules existing that
         * you have specified in your package.json as altairDependencies.
         *
         * @param options passed through from altair.json
         * @returns {altair.Promise}
         */
        startup: function (options) {

            //use the options that were passed in, or the ones we have by default; avoid mutating options
            var _options = options || this.options || {};

            this.log('Executing startup() for %(full)s'); //this.log is one of many extensions you have available in Altair


//            //if your startup is going to take a moment, you should instantiate a Deferred. This is functionality
//            //provided to us by Lifecycle. By overriding this.deferred we are telling Lifecycle to wait until we
//            //manually call this.deferred.resolve();
//
//            this.deferred = new this.Deferred();
//
//            //use the hitch facade to bind any function to any scope
//            setTimeout(hitch(this, function () {
//
//                //once our long running setup is complete, resolve the deferred
//                this.deferred.resolve(this);
//
//            }), 250);

            //let any mixin run their startup
            return this.inherited(arguments);
        },

        /**
         * Execute is called after every modules' startup() is triggered. You can be certain that the environment is as
         * setup as it can possibly be by this point. execute()s are fired in the same order as startup()s and follow the
         * same deferred pattern. Simply this.deferred = new this.Deferred() just like in startup().
         *
         * @returns {altair.Promise}
         */
        execute: function () {

            return this.inherited(arguments);

        },

        /**
         * Because javascript is such a flexible language, it can be easy to make mistakes that would otherwise be
         * impossible in compiled languages. To make live easier for everyone, you should take advantage of the
         * _Assert mixin's API for validating function parameters.
         *
         * @param arg1
         * @param arg2
         */
        myCustomFunction: function (arg1, arg2) {

            this.assertString(arg1, 'You must pass a string');
            this.assert(!!arg2, 'You must pass both arguments');

        },

        /**
         * Make sure anything you setup in startup gets torn down here. A module in Altair *must* be able capable of
         * starting up and shutting down while Altair is running and it should not create any artifacts.
         *
         * @returns {altair.Promise}
         */
        teardown: function () {
            return this.inherited(arguments);
        }

    });
});