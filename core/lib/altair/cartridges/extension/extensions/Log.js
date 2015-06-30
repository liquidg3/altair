define(['altair/facades/declare',
        './_Base',
        'altair/plugins/node!debug',
        'lodash'],
    function (declare,
              _Base,
              debug,
              _) {

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

            var logs = {},
                callbacks = {
                    log:    debug(module.name),
                    warn:   debug(module.name + '::WARN'),
                    err:    debug(module.name + '::ERR'),
                };


            _.each(callbacks, function (cb, key) {

                var altair;

                logs[key] = function () {

                    if (this.nexus) {

                        altair = altair || this.nexus('Altair');

                        altair.emit('did-' + key, {
                            aurgments: arguments
                        });
                    }

                    callbacks[key].apply(this, arguments);

                };

            });


            declare.safeMixin(module, logs);


        }

    });


});