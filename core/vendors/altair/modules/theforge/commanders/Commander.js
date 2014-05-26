define(['altair/facades/declare',
        'altair/modules/commandcentral/mixins/_IsCommanderMixin',
        'altair/facades/hitch',
        'require',
        'altair/plugins/node!fs',
        'altair/plugins/node!underscore.string',
        'altair/plugins/node!mkdirp',
        'altair/plugins/node!path',
        'altair/facades/sprintf',
        'altair/facades/all'

], function (declare,
             _IsCommanderMixin,
             hitch,
             require,
             fs,
             str,
             mkdirp,
             path,
             sprintf,
             all) {

    return declare([_IsCommanderMixin], {


        /**
         * Forge a new module.
         *
         * @param values
         */
        newModule: function (values) {

            this.writeLine('forging new module..');

            //setup context
            var d       = new this.Deferred(),
                vendor  = values.vendor,
                name    = str.capitalize(values.name),
                full    = vendor + ':' + name,
                match   = this.nexus(full),
                destination,
                files   = {};

            if(match) {
                d.reject(new Error('A module named ' + full + ' is already taken!'));
            } else {

                destination = path.join(require.toUrl(values.dir), 'vendors', vendor.toLowerCase(), 'modules', name.toLowerCase());


                files[this.parent.resolvePath('templates/_Module.js')]      = path.join(destination, name + '.js');
                files[this.parent.resolvePath('templates/_package.json')]   = path.join(destination, 'package.json');
                files[this.parent.resolvePath('templates/_README.md')]      = path.join(destination, 'README.md');


                //create destination directory for our module
                mkdirp(destination, this.hitch(function (err) {

                    if(err) {

                        d.reject(new Error(err));

                    } else {

                        //track all our templates being created
                        var list = [];

                        //load the templates and write them
                        Object.keys(files).forEach(this.hitch(function (template) {

                            var def = new this.Deferred();
                            list.push(def);

                            //read template
                            fs.readFile(template, this.hitch(function (err, results) {

                                if(err) {
                                    def.reject(new Error(err));
                                } else {

                                    //completed template
                                    var complete = sprintf(results.toString(), {
                                        name: name,
                                        vendor: vendor,
                                        full: full
                                    });

                                    //add file name to destination
                                    var dest = files[template];

                                    //write the file
                                    fs.writeFile(dest, complete, function (err, results) {

                                        if(err) {
                                            def.reject(new Error(err));
                                        } else {
                                            def.resolve(dest);
                                        }

                                    });

                                }

                            })); //end read template

                        })); //loop all templates


                        //after all templates are done
                        all(list).then(this.hitch(function (results) {

                            this.writeLine('forging complete, created ' + results.length + ' files.');
                            d.resolve();

                        })).otherwise(hitch(d, 'reject'));


                    }

                }));


            }

            return d;
        },

        /**
         * Update schema at runtime
         *
         * @param command
         */
        schemaForCommand: function (command) {

            var schema = this.inherited(arguments);

            //the newModule command has some choices that need updating (destination dir)
            if(schema && command.callback === 'newModule') {

                //get the 'paths' we have set in altair
                var altair          = this.nexus('Altair'),
                    choices    = {};

                altair.paths.forEach(function (path) {
                    choices[path] = require.toUrl(path);
                });

                schema.setOptionFor('dir', 'choices', choices);

            }


            return schema;
        }



    });
});