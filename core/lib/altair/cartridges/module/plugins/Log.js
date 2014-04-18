define(['dojo/_base/declare',
        './_Base',
        'altair/plugins/node!debug'],
    function (declare,
              _Base,
              debug) {

    return declare([_Base], {

        declaredClass: 'altair/cartridges/module/plugins/Log',
        execute:        function (module) {

            //auto enable for now
            debug.enable(module.name);

            declare.safeMixin(module, {
                log: debug(module.name), //enable debugging for '{{vendor}}:{{Name}}'
            });

            return this.inherited(arguments);
        }

    });


});