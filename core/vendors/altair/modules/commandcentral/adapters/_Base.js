define([
    'dojo/_base/declare',
    'altair/events/Emitter',
    'altair/Lifecycle'
        ], function (declare, Emitter, Lifecycle) {


    return declare('altair/modules/commandcentral/adapters/_Base', [Emitter, Lifecycle], {

        /**
         * Not all adapters will implement a notice feature
         */
        notice: function (msg) {

        }

    });

});
