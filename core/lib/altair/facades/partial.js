/**
 * Simple wrapper for lang.partial to make it into an easy function
 */
define(['dojo/_base/lang'], function (lang) {

    return lang.hitch(lang, 'partial');
});
