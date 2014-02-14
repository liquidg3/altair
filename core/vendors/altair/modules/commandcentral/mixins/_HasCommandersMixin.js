define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/Deferred',
        'altair/Lifecycle',
        'altair/events/Emitter'
], function (declare,
             lang,
             Deferred,
             Lifecycle,
             Emitter) {


    return declare('altair/modules/commandcentral/mixins/_HasCommandersMixin', [Lifecycle, Emitter], {

            startup: function () {

                this.on('Altair:CommandCentral::register-commanders').then(lang.hitch(this, 'registerCommanders'));

                return this.inherited(arguments);
            },

            registerCommanders: function (e) {

                var deferred = new Deferred();

                this.parseConfig('configs/commanders.json').then(lang.hitch(deferred, 'resolve'));

                return deferred;
            }

    });

});
