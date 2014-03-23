/**
 * Reads package for events described in it
 */
define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/events/Emitter'
], function (declare,
             hitch,
             Emitter) {

    return declare('altair/modules/events/mixins/_HasEventsMixin', [Emitter], {

            startup: function () {

                if(this.package.events) {
                    this.on('altair:Events::register-events').then(hitch(this, 'registerEvents'));
                }

                return this.inherited(arguments);
            },

            registerEvents: function (e) {
                return this.package.events;
            }

    });

});
