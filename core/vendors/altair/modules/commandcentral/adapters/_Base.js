define([
    'dojo/_base/declare',
    'altair/events/Emitter'
        ], function (declare, Emitter) {


    return declare('altair/modules/commandcentral/adapters/_Base', [Emitter], {

        /**
         * Not all adapters will implement a notice feature
         */
        notice: function (msg) {

        }

    });

});
