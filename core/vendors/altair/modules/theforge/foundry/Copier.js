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
                            dest     = pathUtil.join(to, file);

                        dfd.progress({
                            message: 'populating: ' + file + ' and writing to ' + dest
                        });

                        return this.promise(fs, 'writeFile', dest, complete).then(function () {
                            return {
                                from: pathUtil.join(from, file),
                                to: dest,
                                file: file
                            };
                        });

                    }
                    //it was a dir and handled recursively last step
                    else {

                        return content;
                    }


                }.bind(this)));


            }.bind(this)).then(this.hitch(dfd, 'resolve'));

            return dfd;


        }


    });

});