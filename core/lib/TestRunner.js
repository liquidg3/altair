/**
 * Runs any tests passed in options.
 */
define(['dojo/_base/declare', 'altair/Base', 'dojo/_base/lang', 'dojo/Deferred', 'dojo/node!fs'], function (declare, Base, lang, Deferred, fs) {

    return declare([Base], {

        /**
         * @param options
         * options.paths - an array of paths whose contents are assumed to be tests
         *
         * @returns {*}
         */
        startup: function (options) {

            this.deferred = new Deferred;

            //loop through all folders in options.paths
//                this.includeTest(path);

            return this.inherited(arguments);

        },


        includeTest: function (path) {

            var deferred = new Deferred();

            require(path, function (t) {
                deferred.resolve(t);
            });

            return deferred;

        }

    });
});