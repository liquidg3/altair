/**
 * Gives modules on/emit that are tied into nexus for wicked awesome cross module referencing.
 *
 * It has 2 supported interfaces
 *
 * this.on('Altair:Jarvis::DID_GESTURE', { 'gesture.type': 'the-force' }).then(lang.hitch(this, function (e) {
 *
 *       //the device that triggered the gesture
 *       var device = e.get('device');
 *
 *       //cheating =)
 *       this.nexus('Altair:Jarvis').device('living-room-lights').toggle();
 *
 *   });
 *
 * //or
 *
 * this.on('Altair:Jarvis::DID_GESTURE', lang.hitch(this, function (e) {
 *
 *       ....
 *
 *   }), { 'gesture.type': 'the-force' });
 *
 *
 *
 */
define(['dojo/_base/declare',
        './_Base',
        'dojo/_base/lang',
        'altair/events/Emitter'],

    function (declare,
              _Base,
              lang,
              Emitter) {

    return declare('altair/cartridges/module/plugins/Events',[_Base], {

        execute: function (module) {


            if(!this.cartridge.hasPlugin('altair/cartridges/module/plugins/Nexus')) {
                throw "The module event plugin needs the nexus plugin loaded first."
            }

            //if they are an event emmiter
            if(module.isInstanceOf(Emitter)) {
    
                declare.safeMixin(module, {
    
                    on: function (event, query, callback) {
    
                        //they passed old school
                        if(lang.isFunction(query)) {
                            callback    = query;
                            query       = null;
                        }
    
                        return 'bar';
                    }
                });

            }
            return this.inherited(arguments);
        }

    });


});