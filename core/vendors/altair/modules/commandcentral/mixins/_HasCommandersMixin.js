/**
 * Tells Altair::CommandCentral that you have commanders
 */
define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/Lifecycle',
        'altair/events/Emitter'
], function (declare,
             hitch,
             Lifecycle,
             Emitter) {


    return declare('altair/modules/commandcentral/mixins/_HasCommandersMixin', [Lifecycle, Emitter], {

            startup: function () {

                this.on('Altair:CommandCentral::register-commanders').then(hitch(this, 'registerCommanders'));

                return this.inherited(arguments);
            },

            registerCommanders: function (e) {

                var def = new this.Deferred();

                this.parseConfig('configs/commanders.json').then(hitch(this, function (commanders) {

                    //resolve relative paths
                    Object.keys(commanders).forEach(hitch(this, function (alias) {

                        if(commanders[alias].search('::') === -1) {
                            commanders[alias] = this.name + '::' + commanders[alias];
                        }
                    }));

                    def.resolve(commanders);


                })).otherwise(hitch(def, 'reject'));

                return def;
            }

    });

});
