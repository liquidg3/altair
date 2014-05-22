define(['altair/facades/declare',
        './_Base',
        'altair/plugins/node!gift',
        'lodash',
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

            var d           = new this.Deferred(),
                url         = options.url,
                destination = options.destination,
                version     = options.version;

            //something is missing
            if(!url || !destination) {

                d.reject(new Error('You must pass both a url (git@github.com/liquidfire/Jarvis) and a destination (app)'));

            } else {

                d = this.promise(gift.clone.bind(gift), url, destination).then(function (repo) {

                    return this.update(options);

                }.bind(this));

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

            //if no version is passed, use the last one
            if(!version) {
                return tags.pop();
            }

            return _.find(tags, function (tag) {
                var tagVersion = tag.name.replace(/[^0-9\.]/, '');
                return semver.satisfies(tagVersion, version);
            });

        },

        /**
         * Update a repo to a particular version (or latest if no version is set).
         *
         * @param options
         */
        update: function (options) {

            var d           = new this.Deferred(),
                destination = options.destination,
                version     = options.version,
                repo;


            if(!destination) {

                d.reject(new Error('You must pass both a url (git@github.com/liquidfire/Jarvis) and a destination (app)'));

            } else {

                repo = gift(destination);

                //find a version
                if(version) {

                    d = this.promise(repo, 'tags').then(function (tags) {

                        var tag = this._firstTagThatMatchesVersion(tags, version);

                        if(!tag) {
                            throw new Error('Could not find version ' + version);
                        }

                        return this.promise(repo, 'checkout', tag.commit.id);


                    }.bind(this));

                }
                //no version, just master then
                else {

                    d = this.promise(repo, 'checkout', 'master').then(function () {
                        return destination;
                    });

                }

            }

            return d;

        }

    });

});