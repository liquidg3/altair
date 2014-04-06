define(['dojo/_base/declare',
        './mixins/_HasEventsMixin',
        'altair/events/Emitter'
], function (declare,
             _HasEventsMixin,
             Emitter) {

    return declare([_HasEventsMixin, Emitter], {

    });
});