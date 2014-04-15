/**
 * A pretty slick config loader. You can use it in a few ways. It can load a config by by path, it can accept an "env"
 * option that allows you to setup different configs on a per-environment basis. Lastly, it supports $refs. These allow
 * you to keep your configs nice and thin =)
 *
 * Load basic config:
 *
 * require(['altair/plugins/config!path/to/my/config.json'], function (config) {
 *
 *
 * {
 *      "default": {
 *          "foo": "bar",
 *          "hello": "world"
 *      },
 *
 *      "dev: {
 *          "hello": "there"
 *      }
 * }
 *
 * The config will come through as.
 *
 *  {
 * Load with environment:
 *
 * require(['altair/plugins/config!path/to/my/config.json?env=dev'], function (config) {
 *
 * and it assumes your config.json looks like this:
 *      foo: "bar",
 *      hello: "there"
 *  }
 *
 *  The env can be staging|prod|dev.
 *
 *  Also, here are some ref examples
 *
 *  {
 *      "foo": bar,
 *      "options": {
 *          "$ref": "./foo-options.json"
 *      }
 *  }
 *
 */
define(['require',
        'dojo/node!querystring',
        'dojo/_base/lang',
        'dojo/Deferred',
        'dojo/DeferredList'],

    function (require,
              querystring,
              lang,
              Deferred,
              DeferredList) {


        var parseRefs = function (config, baseUrl) {

            var deferred = new Deferred(),
                list     = [];

            /**
             * Traverse the structure of the config and build a key path
             * @param o
             * @param func
             */
            function traverse(o,func, path) {
                var i;

                for ( i in o ) {
                    func.apply(this,[i,o[i], path || i]);

                    if (o[i] !== null && typeof(o[i]) === "object") {
                        var _path = (path) ? path + '.' + i : i;
                        //going on step down in the object tree!!
                        traverse(o[i],func, _path);
                    }
                }
            }

            traverse(config, function (key, value, fullPath) {

                if(key == '$ref') {

                    var path = value.replace('./', baseUrl + '/'),
                        def  = new Deferred();

                    list.push(def);

                    require(['altair/plugins/config!' + path], function (_config) {

                        lang.setObject(fullPath, _config, config)

                        def.resolve();

                    });

                }

            });

            var deferredList = new DeferredList(list);


            deferredList.then(function () {
                deferred.resolve(config);
            });


            return deferred;

        };



    return {

        load: function(id, require, load){


            var env = null,
                config;

            //they passed ?env=
            if(id.search(/\?/) > 0) {

                var query = querystring.parse(id.split('?').pop());

                id = id.split('?')[0];

                if(query.env) {
                    env = query.env;
                }


            }

            //@TODO move to fs.readFile and JSON.parse
            try {
                config = require.nodeRequire(id);
            } catch (e) {
                load(undefined);
                return;
            }


            if(env) {

                var base = config.default || {};
                lang.mixin(base, config[env] || {});

                config = base;

            }

            //Pull out the base path to this file for the ref parser (it makes ./ work)
            var basePath = id.split('/').slice(0, -1).join('/');

            parseRefs(config, basePath).then(lang.hitch(this, function (config) {
                load(config);
            }));


        },

        /**
         * Traverse config and find any keys called "$ref" and if so, load it and drop it in.
         *
         * @param config
         * @param baseUrl
         */

        normalize: function(id, toAbsMid){

            //no file extension, assume .json for now
            if(id.search('.json') === -1) {
                id = id + '.json';
            }

            if(id.charAt(0) == '.') {
                id = toAbsMid(id);
            } else {
                id = require.toUrl(id);
            }

            return id;

        }};
});
