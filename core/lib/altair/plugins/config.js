/**
 * A pretty slim config loader. You can use it in a few ways. It can load a config by by path, it can accept an "env"
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
        'altair/plugins/node!querystring',
        'altair/plugins/node!path',
        'altair/plugins/node!fs',
        'dojo/_base/lang',
        'altair/Deferred',
        'altair/plugins/node!debug',
        'dojo/DeferredList'],

    function (require,
              querystring,
              path,
              fs,
              lang,
              Deferred,
              debug,
              DeferredList) {


        debug.enable('altair:config');
        debug = debug('altair:config');

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

                var results = fs.readFileSync(id);
                config = JSON.parse(results);

//                config = require.nodeRequire(id);

            } catch (e) {

                if(e instanceof SyntaxError) {
                    debug(e);
                }

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
         * @param config
         * @param baseUrl
         */

        normalize: function(id, toAbsMid){

            var parts = id.split('?'),
                path = parts[0],
                query = parts[1];

            //no file extension, assume .json for now
            if(path.search('.json') === -1) {
                path = path + '.json';
            }

            if(path.charAt(0) === '.') {
                path = toAbsMid(path);
            } else {
                path = require.toUrl(path);
            }

            return (query) ? path + '?' + query : path;

        }};
});
