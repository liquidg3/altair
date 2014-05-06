/**
 * Test module, depends on altair:Events module
 */
define(['altair/facades/declare',
        'altair/events/Emitter'
], function (declare,
             Emitter) {


    return declare([Emitter], {

    });
});