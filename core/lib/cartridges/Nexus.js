/**
 * Nexus is the piece that connects all things in Altair. It uses Resolvers in a sort of Chain of Responsibility
 * implementation that gives any Altair dev the ability to get what they need, when they need it, while explosing
 * an extremely simple API
 */
define(['dojo/_base/declare', 'dojo/_base/lang', 'altair/Lifecyle'], function (declare, lang, Lifecyle) {

    return declare([Lifecyle], {

        startup: function(options){}


    });


});