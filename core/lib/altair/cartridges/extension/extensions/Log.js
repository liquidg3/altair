define(['altair/facades/declare',
        './_Base',
        'altair/plugins/node!debug'],
    function (declare,
              _Base,
              debug) {

    return declare([_Base], {

        name:  'log',
        extend: function (Module) {

            Module.extendOnce({
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

            declare.safeMixin(module, {
                log: debug(module.name)
            });


        }

    });


});