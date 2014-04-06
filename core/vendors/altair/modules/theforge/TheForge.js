/**
 * Test module
 */
define(['dojo/_base/declare',
        '../events/mixins/_HasEventsMixin',
        '../commandcentral/mixins/_HasCommandersMixin'
], function (declare,
             _HasEventsMixin,
             _HasCommandersMixins) {

    return declare([_HasEventsMixin, _HasCommandersMixins], {

    });
});