/**
 * Simple wrapper for lang.hitch to make it into an easy function
 */
define(['dojo/_base/lang'], function (lang) {
    return lang.hitch(lang, function () {

        var arr = {},
            args = Array.prototype.slice.call(arguments, 0);

        args.unshift(arr);

        this.mixin.apply(this, args);

        return arr;
    });

});
