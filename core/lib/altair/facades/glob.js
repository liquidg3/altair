/**
 * Simple wrapper for the "glob" library to allow us to pass an array of globs. Also returns a proper
 * dojo/Deferred to make it like working with promises elsewhere in Altair
 */
define(['dojo/Deferred',
        'dojo/promise/all',
        'altair/facades/hitch',
        'dojo/node!glob'
], function (Deferred, all, hitch, glob) {

    return function (patterns, options) {

        var deferred = new Deferred();

        if(patterns instanceof Array) {

            var list = patterns.map(function (path) {

                var d = new Deferred();

                glob(path, options, function (err, matches) {
                    if(err) {
                        d.reject(err);
                    } else {
                        d.resolve(matches);
                    }
                });

                return d;
            });

            all(list).then(function (matches) {
                deferred.resolve(matches.concat.apply([], matches));
            }).otherwise(hitch(deferred, 'reject'));

        } else {
            glob(patterns, options, function (err, matches) {
                if(err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(matches)
                }
            });
        }

        return deferred;
    };

});
