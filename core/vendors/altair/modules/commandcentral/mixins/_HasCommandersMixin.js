/**
 * Tells altair::CommandCentral that you have commanders
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

                this.on('altair:CommandCentral::register-commanders').then(hitch(this, 'registerCommanders'));

                return this.inherited(arguments);
            },

            registerCommanders: function (e) {

                var def = new this.Deferred();

                this.parseConfig('configs/commanders.json').then(hitch(this, function (commanders) {

                    //resolve relative paths
                    Object.keys(commanders).forEach(hitch(this, function (alias) {

                        if(!commanders[alias].path) {
                            throw "You must pass your commander a path";
                        }

                        if(commanders[alias].path.search('::') === -1) {
                            commanders[alias].path = this.name + '::' + commanders[alias].path;
                        }
                    }));

                    def.resolve(commanders);


                })).otherwise(hitch(def, 'reject'));

                return def;
            }

    });

});
