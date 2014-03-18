/**
 * Test module
 */
define(['dojo/_base/declare',
        'altair/modules/events/mixins/_HasEventsMixin',
        'altair/events/Emitter'
], function (declare,
             _HasEventsMixin,
             Emitter) {

    return declare([_HasEventsMixin, Emitter], {

        startup: function () {
            return this.inherited(arguments);
        }

    });
});