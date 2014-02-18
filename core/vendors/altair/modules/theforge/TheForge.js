/**
 * Test module
 */
define(['dojo/_base/declare',
    'altair/modules/events/mixins/_HasEventsMixin',
    'altair/events/Emitter',
    'altair/modules/commandcentral/mixins/_HasCommandersMixin'
], function (declare,
             _HasEventsMixin,
             Emitter,
             _HasCommandersMixins) {

    return declare('altair/modules/thelodge/TheLodge', [_HasEventsMixin, Emitter, _HasCommandersMixins], {

        startup: function () {
            return this.inherited(arguments);
        }

    });
});