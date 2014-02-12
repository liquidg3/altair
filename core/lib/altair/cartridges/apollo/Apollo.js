define(['dojo/_base/declare',
        'dojo/_base/lang',
        '../_Base',
        'dojo/Deferred',
        'apollo/Apollo',
        'require'
],

        function (declare,
              lang,
              _Base,
              Deferred,
              Apollo,
              require) {

        return declare('altair/cartridges/apollo/Apollo', [_Base], {


            apollo: null,

            startup: function (options) {

                options = options || this.options;

                //do they pass the fieldtypes they want loaded?
                if('fieldTypes' in options) {

                } else {

                    //the base fieldtypes i think we need to get altair to work
                    options.fieldTypes = [
                        'apollo/fieldtypes/Text',
                        'apollo/fieldtypes/Bool',
                        'apollo/fieldtypes/Int',
                        'apollo/fieldtypes/Float',
                        'apollo/fieldtypes/Date'
                    ];

                }

                this.deferred   = new Deferred;
                this.apollo     = new Apollo();

                require(options.fieldTypes, lang.hitch(this, function () {

                    var types = Array.prototype.slice.call(arguments);

                    for(var i = 0; i < types.length; i ++) {
                        var type = new types[i]();
                        this.apollo.addType(type);
                    }

                    this.deferred.resolve(this);

                }));

                return this.inherited(arguments);

            }


        });


    });
