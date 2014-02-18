/**
 * Test module
 */
define(['dojo/_base/declare',
        'altair/modules/events/mixins/_HasEventsMixin',
        'altair/modules/commandcentral/mixins/_HasCommandersMixin'
], function (declare,
             _HasEventsMixin,
             _HasCommandersMixin) {

    return declare('altair/modules/thelodge/TheLodge', [_HasEventsMixin, _HasCommandersMixin], {


    });
});