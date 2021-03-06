define(['altair/facades/declare',
        './_Base',
        'altair/plugins/node!gift',
        'lodash',
        'altair/plugins/node!semver',
        'altair/plugins/node!rimraf',
        'altair/plugins/node!path',
        'altair/plugins/node!fs'
], function (declare,
             _Base,
             gift,
             _,
             semver,
             rimraf,
             pathUtil,
             fs) {

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
                destination = options.destination;

            //something is missing
            if(!url || !destination) {

                d.reject(new Error('You must pass both a url (git@github.com/liquidfire/Jarvis) and a destination (app) in order to clone a repository.'));

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

            var sorted = tags.sort(function (a, b) {

                var a1 = semver.clean(a.name),
                    b1 = semver.clean(b.name);

                return semver.compare(a1, b1);

            });

            //if no version is passed, use the last one
            if(!version) {
                return sorted.pop();
            }

            return _.find(sorted.reverse(), function (tag) {
                var tagVersion = semver.clean(tag.name);
                return semver.satisfies(tagVersion, version);
            });

        },

        /**
         * Update a repo to a particular version (or latest if no version is set).
         *
         * @param options
         */
        update: function (options) {

            var dfd         = new this.Deferred(),
                destination = options.destination,
                version     = options.version,
                clean       = options.clean,
                repo;


            if(!destination) {

                dfd.reject(new Error('You must pass both a url (git@github.com/liquidfire/Jarvis) and a destination (app)'));

            } else {

                repo = gift(destination);

                //find a version
                if(version && version !== '*') {

                    dfd.progress({
                        message: 'Searching tags for version ' + version
                    });

                    this.promise(repo, 'tags').then(function (tags) {

                        var tag = this._firstTagThatMatchesVersion(tags, version);

                        if(!tag) {
                            throw new Error('Could not find version ' + version);
                        }

                        dfd.progress({
                            message: 'Found tag ' + tag.name + '. Beginning checkout.'
                        });

                        return this.promise(repo, 'checkout', tag.commit.id).then(this.hitch(dfd, 'resolve')).otherwise(this.hitch(dfd, 'reject'));


                    }.bind(this));

                }
                //no version, just master then
                else {

                    dfd.progress({
                        message: 'Checking out master.'
                    });

                    this.promise(repo, 'checkout', 'master').then(this.hitch(dfd, 'resolve')).otherwise(this.hitch(dfd, 'reject'));

                }

            }

            if(clean) {

                return dfd.then(this.hitch('clean', destination))

            }

            return dfd;

        },

        clean: function (path) {

            var dir = pathUtil.join(path, '.git');
            return this.promise(rimraf, dir);

        },


        status: function (options) {

            var destination = options.destination,
                dfd = new this.Deferred(),
                repo;

            if(!destination) {
                throw new Error('You must pass a "destination" to git.status({}).');
            }

            //is there git folder
            this.promise(fs, 'stat', pathUtil.join(destination, '.git')).then(function () {

                repo = gift(destination);

                return this.promise(repo, 'status');

            }).otherwise(function () {

                dfd.resolve(null);

            });

            return dfd;


        }

    });

});