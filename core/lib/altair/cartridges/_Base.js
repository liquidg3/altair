define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/events/Emitter'],

    function (declare,
              Lifecycle,
              Emitter) {

    return declare([Lifecycle, Emitter], {

        altair:     null,
        options:    null,
        name:       false,

        constructor: function (altair, options) {

            this.altair     = altair;
            this.options    = options || {};

            if(!this.name) {
                throw new Error('Your cartridge must define a name');
            }

            if(!altair) {
                throw new Error("You must pass an instance of Altair to any cartridge");
            }

        }



    });


});