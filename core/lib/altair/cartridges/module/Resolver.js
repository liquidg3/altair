/**
 * The nexus resolver used to let users gain access to modules via nexus
 */
define(['dojo/_base/declare',
        'altair/cartridges/nexus/ResolverBase',
        'dojo/_base/lang'], function (declare,
                                      ResolverBase,
                                      lang) {

    return declare('altair/cartridges/module/Resolver', [ResolverBase], {

        resolve: function (key, options, config) {},
        handles: function (key) {
            return false;
        }


    });


});