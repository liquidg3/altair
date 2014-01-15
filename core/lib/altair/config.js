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
