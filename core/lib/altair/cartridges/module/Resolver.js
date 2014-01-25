/**
 * The nexus resolver used to let users gain access to modules via nexus
 */
define(['dojo/_base/declare',
        'altair/cartridges/nexus/_ResolverBase',
        'dojo/_base/lang'], function (declare,
                                      _ResolverBase,
                                      lang) {

    return declare('altair/cartridges/module/Resolver', [_ResolverBase], {

        resolve: function (key, options, config) {},
        handles: function (key) {
            return false;
        }


    });


});