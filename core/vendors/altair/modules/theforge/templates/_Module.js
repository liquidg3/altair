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
 * 2. Building a Commander: altair.io/core/vendors/altair/modules/commandcentral/README.md
 * 3. The Adapter Pattern:  altair.io/core/vendors/altair/modules/adapters/README.md
 *
 */

// To add custom node_modules into altair define the path using 'altair/plugins/node!{{module}}'
define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/facades/hitch'
], function (declare,
             Lifecycle,
             hitch) {

    //by mixing in Lifecycle, we get startup(options), execute(options), and shutdown()
    return declare([Lifecycle], {


        /**
         * Startup is called after every module is instantiated, but you still can only rely on module's existing that
         * you have specified in your package.json as altairDependencies.
         *
         * @param options
         * @returns {altair.Deferred}
         */
        startup: function (options) {

            //use the options that were passed in, or the ones we have by default; avoid mutating options
            var _options = options || this.options;

            console.log('Executing startup() for %(full)s');

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
         * @returns {altair.Deferred}
         */
        execute: function () {

            return this.inherited(arguments);

        },

        /**
         * Make sure anything you setup in startup gets torn down here. A module in Altair *must* be able capable of
         * starting up and shutting down while Altair is running and it should not create any artifacts.
         *
         * @returns {altair.Deferred}
         */
        teardown: function () {
            return this.inherited(arguments);
        }

    });
});