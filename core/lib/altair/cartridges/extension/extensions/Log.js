define(['altair/facades/declare',
        './_Base',
        'altair/plugins/node!debug'],
    function (declare,
              _Base,
              debug) {

    return declare([_Base], {

        name:  'log',
        extend: function (Module) {

            Module.extend({
                toString: function () {
                    if(this.name) {
                        return '[object ' + this.name + ']';
                    } else {
                        return '[object Object]';
                    }

                }
            });

            return this.inherited(arguments);
        },

        execute: function (module) {

            //auto enable for now
            debug.enable(module.name);

            declare.safeMixin(module, {
                log: debug(module.name)
            });


        }

    });


});