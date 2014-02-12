/**
 * Reads package for events described in it
 */
define(['dojo/_base/declare',
        'altair/facades/hitch'
], function (declare,
             hitch) {

    return declare('altair/modules/events/mixins/_HasEventsMixin', null, {

            startup: function () {
                if(this.package.events) {
                    this.on('Altair:Events::register-events').then(hitch(this, 'registerEvents'));
                }

                return this.inherited(arguments);
            },

            registerEvents: function (e) {
                return this.package.events;
            }

    });

});
