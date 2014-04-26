/**
 * Test module, depends on altair:Events module
 */
define(['altair/facades/declare',
        'dojo/_base/lang',
        'altair/events/Emitter'
], function (declare,
             lang,
             Emitter) {


    return declare([Emitter], {

    });
});