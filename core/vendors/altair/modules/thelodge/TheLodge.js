define(['altair/facades/declare',
        'altair/modules/events/mixins/_HasEventsMixin',
        'altair/modules/commandcentral/mixins/_HasCommandersMixin'
], function (declare,
             _HasEventsMixin,
             _HasCommandersMixin) {

    return declare([_HasEventsMixin, _HasCommandersMixin], {


    });
});