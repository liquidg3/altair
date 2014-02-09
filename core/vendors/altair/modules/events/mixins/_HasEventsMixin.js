/**
 * Kickass mixin for event <-> nexus integration
 */
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/Deferred'
], function (declare,
             lang,
             Deferred) {


    return declare('altair/modules/events/mixins/_HasEventsMixin', null, {

            startup: function () {
                if(this.package.events) {
                    this.on('Altair:Events::REGISTER_EVENTS').then(lang.hitch(this, 'registerEvents'));
                }

                return this.inherited(arguments);
            },

            registerEvents: function (e) {
                return this.package.events;
            }

    });

});
