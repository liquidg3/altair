define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/Deferred'
], function (declare,
             lang,
             Deferred) {


    return declare('altair/modules/commandcentral/mixins/_HasCommandersMixin', null, {

            startup: function () {

                this.on('Altair:CommandCentral::REGISTER_COMMANDERS').then(lang.hitch(this, 'registerCommanders'));

                return this.inherited(arguments);
            },

            registerCommanders: function (e) {

                var deferred = new Deferred();

                this.parseConfig('configs/commanders.json').then(lang.hitch(deferred, 'resolve'));

                return deferred;
            }

    });

});
