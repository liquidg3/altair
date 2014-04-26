/**
 * This simple cartridge foundry helps us create cartridges. It's every basic, but it gets the job done.
 */
define(['altair/facades/declare',
        'altair/facades/hitch',
        'dojo/promise/all',
        'dojo/Deferred'],
function (declare,
          hitch,
          all,
          Deferred) {

    return declare(null, {


        constructor: function (altair) {

            this.altair = altair;

            if(!this.altair) {
                throw new Error('A cartridge Foundry needs an instance of Altair.');
            }


        },

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

            var list            = options.map(hitch(this, 'buildOne'));

            return all(list);
        },

        /**
         * Builds you a cartridge
         *
         * @param options
         * @returns {dojo.Deferred}
         */
        buildOne: function (options) {

            var def = new Deferred();

            require([options.path], hitch(this, function (Cartridge) {
                def.resolve(new Cartridge(this.altair, options.options));
            }));

            return def;
        }

    });

});
