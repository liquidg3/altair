/**
 * Test module, depends on altair:Events module
 */
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'altair/events/Emitter'
], function (declare,
             lang,
             Emitter) {


    return declare('altair/modules/mockwithevents2/MockWithEvents2', [Emitter], {

    });
});