
define(['altair/facades/declare',
        'altair/Lifecycle',
        'lodash',
        'altair/plugins/node!mkdirp',
        'altair/plugins/node!fs',
        'altair/plugins/node!path',
        'altair/facades/sprintf',
], function (declare,
             Lifecycle,
             _,
             mkdirp,
             fs,
             pathUtil,
             sprintf) {

    return declare([Lifecycle], {


        /**
         * Moves all files in 'from' directory to the 'to' directory
         *
         * @param from
         * @param to
         * @param context
         */
        execute: function (from, to, context) {

            //delay
            var dfd = new this.Deferred(),
                filenames = [];

            //make the destination directory
            this.promise(mkdirp, to).then(function () {

                dfd.progress({
                    message: 'Created destination dir: ' + to
                });

                //loop through everything in the from and copy it to to (while dropping in context)
                return this.promise(fs, 'readdir', from);

            }.bind(this)).then(function (files) {

                filenames = files;

                dfd.progress({
                    message: 'Found ' + files.length + ' files/dirs in ' + from
                });

                //loop through and read all files (or dive into subdirectories)
                return this.all(_.map(files, function (file) {

                    var path = pathUtil.join(from, file);

                    return this.promise(fs, 'stat', path).then(function (stat) {

                        if(stat.isDirectory()) {

                            dfd.progress({
                                message: file + ' is a dir, diving in.'
                            });

                            return this.execute(path, pathUtil.join(to, file), context);

                        } else {

                            dfd.progress({
                                message: 'Reading ' + file
                            });

                            return this.promise(fs, 'readFile', path);

                        }

                    }.bind(this));

                }.bind(this)));

            }.bind(this)).then(function (files) {

                //loop through all files and drop in context
                return this.all(_.map(files, function (content, i) {

                    //we read a file, drop in context and write to destination
                    if(content instanceof Buffer) {

                        var complete = sprintf(content.toString(), context),
                            file     = filenames[i],
                            dest     = pathUtil.join(to, file),
                            _dfd     = new this.Deferred();

                        dfd.progress({
                            message: 'checking if ' + dest + ' already exists'
                        });


                        this.promise(fs, 'stat', dest).then(function (stats) {

                            dfd.progress({
                                message: 'file already exists at ' + dest + '. skipping',
                                type: 'warning'
                            });

                            _dfd.resolve({
                                from: pathUtil.join(from, file),
                                to: dest,
                                file: file,
                                skipped: true
                            });


                        }.bind(this)).otherwise(function () {

                            dfd.progress({
                                message: 'no file found at: ' + dest + '. writing contents'
                            });

                            this.promise(fs, 'writeFile', dest, complete).then(function () {
                                _dfd.resolve({
                                    from: pathUtil.join(from, file),
                                    to: dest,
                                    file: file
                                });
                            }).otherwise(this.hitch(function (err) {
                                _dfd.reject(err);
                            })); //maybe permissions error?


                        }.bind(this));

                        return _dfd;


                    }
                    //it was a dir and handled recursively in the previous step
                    else {

                        return content;
                    }


                }.bind(this)));


            }.bind(this)).then(this.hitch(function (results) {

                dfd.resolve(results);

            }));

            return dfd;


        }


    });

});