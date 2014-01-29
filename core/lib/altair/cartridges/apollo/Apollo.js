/**
 * The cache cartridge handles cache through the use of "plugins". Plugins are easy to make and introduce into the system.
 * First, take a look at ./plugins/Base.js for a list of methods you need to implement. We are going to try and ship
 * with a few popular plugins (memcached for now) and hope that people will write more as needed.
 *
 * If you want to configure cache, create an app/config/cache.json file with:
 *
 * {
 *
 *  "plugin": {
 *      "path": "my/cache/adapter",
 *      "options": {
 *          "host": "127.0.0.1",
 *          "port": 7777
 *      }
 *  }
 *
 * }
 *
 * Make sure your adapter implements everything inside of altair/cartridges/cache/plugins/Base and that every method
 * returns a dojo/Deferred
 *
 */
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