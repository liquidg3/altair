/**
 * A Form to collect a lot of input from the end user through CLI
 */
define([
    'dojo/_base/declare',
    'altair/events/Emitter',
    'apollo/_HasSchemaMixin',
    'altair/facades/mixin',
    'altair/facades/hitch',
    'dojo/_base/lang',
    'dojo/node!i18n-2'
],
    function (declare,
              Emitter,
              _HasSchemaMixin,
              mixin,
              hitch,
              lang,
              i18n) {


        return declare('altair/modules/commandcentral/forms/Form', [Emitter, _HasSchemaMixin], {

            execute: function (adapter) {

                var d = new this.module.Deferred();

                if(!this._schema) {
                    d.reject(i18n.__('%s needs a schema to function.'));
                } else {

                    

                }

                return d;
            }

        });

    });
