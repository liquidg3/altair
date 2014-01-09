/**
 * Well, this is it... Altair in its entirety. The whole application is simply a cartridge loader. These cartridges are
 * responsible for enhancing the environment in various ways. It should be really easy to augment the platform at a very
 * low level this way. Chances are that if you need to add new functionality into the platform you should be doing it
 * as a module. The only things that should be cartridges are components that need to exist before the module system
 * is ready. Currently, this is things like Nexus, Cache, Database, and a few others. See core/config/altair.json to see
 * the current config.
 */
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'altair/Base'], function (declare, lang, Base) {

    return declare([Base], {

        /**
         * Send me an array of cartridge options
         *
         * @param options
         */
        build: function (options) {

            options.forEach(lang.hitch(this, function (_options) {
                this.buildOne(_options);
            }));

        },

        buildOne: function (options) {
            console.log('buildingOne', options);
        }

    });
});