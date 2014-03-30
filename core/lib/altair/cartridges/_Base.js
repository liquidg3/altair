define(['dojo/_base/declare',
        'altair/Lifecycle'],

    function (declare,
              Lifecycle) {

    return declare([Lifecycle], {

        altair: null,
        options: null,
        declaredClass: false,

        constructor: function (altair, options) {

            this.altair = altair;
            this.options = options || {};

            if(!this.declaredClass) {
                throw new Error('Your cartridge must define a declaredClass');
            }

            if(!altair) {
                throw "You must pass an instance of Altair to any cartridge";
            }

        }



    });


});