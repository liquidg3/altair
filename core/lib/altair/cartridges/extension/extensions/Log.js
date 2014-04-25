define(['altair/facades/declare',
        './_Base',
        'altair/plugins/node!debug'],
    function (declare,
              _Base,
              debug) {

    return declare([_Base], {

        name: 'log',
        execute:        function (module) {

            //auto enable for now
            debug.enable(module.name);

            declare.safeMixin(module, {
                log: debug(module.name), //enable debugging for '{{vendor}}:{{Name}}'
                toString: function () {
                    if(this.name) {
                        return '[object ' + this.name + ']';
                    } else {
                        return '[object Object]';
                    }

                }
            });

            return this.inherited(arguments);
        }

    });


});