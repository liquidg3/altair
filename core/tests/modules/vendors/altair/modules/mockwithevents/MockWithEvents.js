/**
 * Test module
 */
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'altair/modules/events/mixins/_HasEventsMixin'
], function (declare, lang, _HasEventsMixin) {


    return declare('altair/modules/mockwithevents/MockWithEvents', [_HasEventsMixin], {

    });
});