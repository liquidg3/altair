/**
 * This simple cartridge factory helps us create cartridges. It's every basic, but it gets the job done.
 */
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/DeferredList',
        'dojo/Deferred'], function (declare, lang, DeferredList, Deferred) {

    return declare(null, {

        /**
         * Send me an array of cartridge options.
         *
         * @param options
         */
        build: function (options) {

            var list     = [];

            options.forEach(lang.hitch(this, function (_options) {
                list.push(this.buildOne(_options));
            }));

            var deferred = new DeferredList(list);

            return deferred;


        },

        buildOne: function (options) {

            var def = new Deferred();

            require([options.path], function (Cartridge) {
                def.resolve(new Cartridge(options.options));
            });

            return def;
        }

    });
});