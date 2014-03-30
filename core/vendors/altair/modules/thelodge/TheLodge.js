define(['altair/facades/declare',
        'altair/modules/events/mixins/_HasEventsMixin',
        'altair/modules/commandcentral/mixins/_HasCommandersMixin',
        'altair/plugins/node!underscore.string'
], function (declare,
             _HasEventsMixin,
             _HasCommandersMixin,
             str) {

    return declare([_HasEventsMixin, _HasCommandersMixin], {


        vcs: function (type, options) {

            if(type.search('/') === -1) {
                type = 'vcs/' + str.capitalize(type);
            }

            return this.foundry(type, options);

        }


    });
});