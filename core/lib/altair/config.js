/**
 * This config loader is going to be built out (hopefully??) so we can search app/communit/core or whatever
 * arbitrary path precedence is set.
 *
 */
define(['require'], function (require) {

    return {

        load: function(id, require, load){

            load(function () {
                return require.nodeRequire(id);
            }());

        },

        normalize: function(id, toAbsMid){

            return require.toUrl(id)

        }};
});
