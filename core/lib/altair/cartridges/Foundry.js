/**
 * This simple cartridge foundry helps us create cartridges. It's every basic, but it gets the job done.
 */
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/DeferredList',
        'dojo/Deferred'], function (declare,
                                    lang,
                                    DeferredList,
                                    Deferred) {

    return declare(null, {

        /**
         * Send me an array of cartridge options and I'll return a deferred that will resolve once all of them our built.
         *
         * [
         *      {
         *          "path": "path/to/cartridge",
         *          "options": {
         *              "foo": "bar"
         *          }
         *      }
         *
         * ]
         *
         * @param options
         * @return dojo/Deferred
         *
         */
        build: function (options) {

            var list     = [];

            options.forEach(lang.hitch(this, function (_options) {
                list.push(this.buildOne(_options));
            }));

            var deferredList = new DeferredList(list),
                deferred     = new Deferred();

            deferredList.then(lang.hitch(this, function (results) {

                var cartridges = [];

                results.forEach(lang.hitch(this, function (item, index) {
                    if(item[0]) {
                       cartridges.push(item[1]);
                    }
                    else {
                        throw "Cartridge:" + options.paths[index];
                    }
                }));

                deferred.resolve(cartridges);

            }));

            return deferred;


        },

        /**
         * Builds you a cartridge
         *
         * @param options
         * @returns {dojo.Deferred}
         */
        buildOne: function (options) {

            var def = new Deferred();

            require([options.path], function (Cartridge) {
                def.resolve(new Cartridge(options.options));
            });

            return def;
        }

    });
});
