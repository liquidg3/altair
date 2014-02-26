/**
 * Gives us the ability to use: new this.Deferred() in our modules! Also, you can use this.hitch(callback
 * to automatically set the scope of your callback to your module.
 *
 * Here is an example of how you should do your deferreds.
 *
 * myAction: function () {
 *      this.set('foo', true)                    _________________________________
 *      var d = new this.Deferred();            \                                 \
 *                                              v                                 \
 *      fs.someLongNodeJsOperation('my/path', this.hitch(function () {            \
 *                                                                                \
 *          var flag = this.get('foo');            --   this will resolve to ------
 *                       ^                         \    (that means no more _this, that's, or me's =)
 *                       \-------------------------
 *
 *          d.resolve(true);
 *
 *      }));
 *
 *
 *      return d;
 * }
 */
define(['dojo/_base/declare',
        './_Base',
        'altair/Deferred',
        'dojo/_base/lang'],

    function (declare,
              _Base,
              Deferred,
              lang) {

    return declare([_Base], {

        declaredClass: 'altair/cartridges/module/plugins/Deferred',
        execute: function (module) {

            declare.safeMixin(module, {
                Deferred: Deferred,
                hitch: function () {
                    var args = Array.prototype.slice.call(arguments, 0);
                    args.unshift(this);
                    return lang.hitch.apply(lang.hitch, args);
                }
            });

            return this.inherited(arguments);
        }

    });


});