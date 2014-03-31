define(['altair/facades/declare',
        'altair/modules/thelodge/vcs/_Base',
        'altair/plugins/node!gift',
        'altair/plugins/node!underscore',
        'altair/plugins/node!semver',
        'altair/facades/hitch'
], function (declare,
             _Base,
             gift,
             _,
             semver,
             hitch) {

    "use strict";
    return declare([_Base], {

        /**
         * Clone a repo to a destination.
         *
         * @param options { url, destination[, version] }
         * @returns {Deferred}
         */
        clone: function (options) {

            var d           = new this.module.Deferred(),
                url         = options.url,
                destination = options.destination,
                version     = options.version;

            //something is missing
            if(!url || !destination) {

                d.reject(new Error('You must pass both a url (git@github.com/liquidfire/Jarvis) and a destination (app)'));

            } else {

                gift.clone(url, destination, hitch(this, function (err, repo) {

                    if(err) {
                        d.reject(err);
                    } else {

                        if(version) {

                            //find a tag that matches this version
                            repo.tags(hitch(this, function (err, tags) {

                                var tag = this._firstTagThatMatchesVersion(tags, version);

                                if(!tag) {
                                    d.reject(new Error('Could not find version ' + version + ' in ' + url));
                                } else {
                                    repo.checkout(tag.commit.id, hitch(this, function (err, results) {
                                        if(err) {
                                            d.reject(new Error(err));
                                        } else {
                                            d.resolve(repo.path);
                                        }
                                    }));
                                }

                            }));

                        } else {
                            d.resolve(repo.path);
                        }



                    }

                }));

            }

            return d;
        },

        /**
         * Loops through tags till it finds one that matches the string passed.
         *
         * @param tags
         * @param version
         * @returns {*}
         * @private
         */
        _firstTagThatMatchesVersion: function(tags, version) {

            return _.find(tags, function (tag) {
                var tagVersion = tag.name.replace(/[^0-9\.]/, '');
                return semver.satisfies(tagVersion, version);
            });

        },

        /**
         * Alias for clone so it matches signature of _Base and other vcs's
         *
         * @param options
         * @returns {Deferred}
         */
        checkout: function (options) {
           return this.clone(options);
        }

    });

});