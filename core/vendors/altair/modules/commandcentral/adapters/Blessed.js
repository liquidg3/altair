define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/facades/mixin',
        'altair/modules/commandcentral/adapters/_Base',
        'dojo/node!blessed',
        'dojo/node!figlet',
        'altair/Deferred',
        'dojo/_base/lang'
], function (declare,
             hitch,
             mixin,
             _Base,
             blessed,
             figlet,
             Deferred,
             lang) {



    return declare('altair/modules/commandcentral/adapters/Blessed', [_Base], {

        screen:     null,
        noticeBox:  null,
        splashBox:  null,
        longLabels: false,
        blessed:    blessed,
        elementTypeMap: null,
        _shouldRedraw: false,
        _redrawTimeout: null,

        /**
         * Sets up blessed screen
         *
         * @returns {*}
         */
        startup: function (options) {

//            options = options || this.options;

            //we map apollo element types (text, file, bool) to blessed fields the best we can when we are rendering
            //a form. this is the map we use to do our best match on mapping
//            if(!options.elementTypeMap) {
//
//                options.elementTypeMap = {
//                    "*":    hitch(blessed, 'textbox'),
//                    "text": hitch(blessed, 'textbox'),
//                    "bool": hitch(blessed, 'checkbox')
//                };
//
//            }

            this.screen = blessed.screen({ autoPadding: false });

            this.screen.key(['escape', 'q', 'C-c'], function (ch, key) {
                return process.exit(0);
            });

            process.title = 'Altair:CommandCentral';

            return this.inherited(arguments);

        },

        /**
         * Give us a slight delay in redraws so calling it 50x in 1 millisecond doesn't really re-render the screen
         */
        redraw: function () {

            if(this._redrawTimeout) {
                clearTimeout(this._redrawTimeout);
            }

            //splash almost always on top
            if(this.splashBox) {
                this.splashBox.detach();
                this.screen.append(this.splashBox);
            }

            //make sure notice is always at top of render stack
            if(this.noticeBox) {
                this.noticeBox.detach();
                this.screen.append(this.noticeBox);
            }

            this._redrawTimeout = setTimeout(hitch(this, function () {

                //mak sure body is the very bottom, all the time
                if(!this.bodyBox) {

                    this.bodyBox = blessed.box(mixin({
                        left: 'center',
                        top: 'center',
                        width: '100%',
                        height: '100%'
                    }, this.styles('body')));

                    this.screen.prepend(this.bodyBox);
                }


                this.screen.render();


            }), 20);


        },

        /**
         * This is shown when the platform boots
         *
         * @returns {altair.Deferred}
         */
        splash: function () {

            var styles = this.styles('#splash'),
                d      = new Deferred();

            d.resolve();

            return d;

/***
 * NOT SURE IF WE REALLY NEED A SPLASH ANYMORE


            if(!styles) {
                throw "You must create a commanders/styles.css and drop in a style for #splash";
            }

            styles = mixin({
                parent:  this.screen
            }, styles);

            //after figlet has done its thing (or not), lets render the splash box
            this.figet(styles).then(hitch(this, function () {

                this.splashBox = new blessed.Box(styles);
                this.splashBox.focus();
                this.redraw();


                setTimeout(hitch(this, function () {

                    this.splashBox.detach();
                    this.splashBox = null;
                    this.redraw();

                    d.resolve();

                }), 1500);

            }));

            return d;
*/
        },

        /**
         * Should show a progress dialog with a message
         */
        showProgress: function (message) {

            this.progress = this.progress || new blessed.Loading({
                parent: this.screen,
                border: {
                    type: 'ascii'
                },
                height: 'shrink',
                width: 'half',
                top: 'center',
                left: 'center',
                tags: true,
                keys: false,
                hidden: true,
                vi: true
            });

            this.progress.load('Loading...');

            return this.progress;
        },

        /**
         * Hides progress
         */
        hideProgress: function () {
            this.progress.detach();
            delete this.progress;
        },

        /**
         * Outputs a notice to the screen
         *
         * @param str
         */
        notice: function (str) {

            if (!this.noticeBox) {

                str = 'notice: ' + str;

                this.noticeBox = new blessed.Box(mixin({
                    left: 0,
                    bottom: 0,
                    width: "100%",
                    top: "80%",
                    content: str + "\n",
                    scrollable: true,
                    border: {
                        type: 'line'
                    },
                    style: {
                        fg: 'white',
                        bg: 'black'
                    }
                }, this.styles('#notice')));


                this.screen.append(this.noticeBox);

            } else {
                this.noticeBox.content += str + "\n";
            }

            this.redraw();

        },

        /**
         * Render a form and resolve the deferred with the results
         *
         * @param elements
         * @param options
         */
        form: function (schema, options) {

            options = this._normalizeOptions(options);

            var selector = 'form',
                d        = new Deferred();

            this.module.foundry('adapters/blessed/FormFoundry').then(function (foundry) {

                var form = foundry.build(this, schema, options);




            });


            return d;

        },

        /**
         * Ouptut a select box
         *
         * @param question
         * @param selectOptions
         * @param options
         * @returns {dojo.Deferred}
         */
        select: function (question, selectOptions, options) {

            var def = new Deferred(),
                selector = 'select',
                list,
                styles,
                keys = Object.keys(selectOptions),
                values = keys.map(function (key) {
                    return selectOptions[key];
                });

            options = this._normalizeOptions(options);

            if(options.id) {
                 selector += ', #' + options.id;
            }

            //defaults
            styles = mixin({
                parent:     this.screen,
                items:      values.slice(0),
                label:      question,
                mouse:      true,
                keys:       true,
                width:      100
            }, options, this.styles(selector));

            list = new blessed.List(styles);

            list.on('select', hitch(this, function (listItem, index) {
                list.detach();
                this.redraw();
                def.resolve(keys[index]);
            }));

            list.focus();
            this.redraw();

            return def;
        },

        /**
         * When a commander is brought into focus
         *
         * @param commander
         */
        focus: function (commander) {

            this.inherited(arguments); //will mixin styles

            var d, //deferred if we use one
                styles;

            //if this commander has styles, lets apply a bg
            if(commander.styles) {

                styles = this.styles('#bg');

                if(styles) {

                    d = new Deferred();

                    this.figet(styles).then(hitch(this, function () {
                        var o = mixin({
                            width:  '100%',
                            height: '100%',
                            top:    'center',
                            left:   'center'
                        }, styles);


                        this.bg = blessed.box(o);
                        this.screen.append(this.bg);
                        this.redraw();

                        d.resolve(commander);

                    }));
                }

            }

            return d;

        },

        /**
         * Destroy the bg if one exists
         */
        blur: function () {
            if(this.bg) {
                this.bg.detach();
                this.bg = null;
                this.redraw();
            }

            return this.inherited(arguments);

        },

        /**
         * Override how styles work to return something that works with blessed.
         *
         * @param selector
         */
        styles: function (selector) {

            var styles = this.inherited(arguments),
                org      = mixin({}, styles), // make copy for backup
                modified = {},
                map      = { //how we map normal css to blessed for ones where replacing - with . will not cut it
                    'color':            'style.fg',
                    'background-color': 'style.bg',
                    'border-color':     'border.fg',
                    'text-align':       'align'
                };



            //copy the things i know i need to move based on the map, delete them, but save the remainder
            Object.keys(map).forEach(function (k) {

                if(styles[k]) {
                    lang.setObject(map[k], styles[k], modified);
                    delete styles[k]; //so there are no duplicate looking selectors (we pass original back with results, so it's ok)
                }
            });


            //lastly, replace any - with . and drop any px
            Object.keys(styles).forEach(function (k) {

                //drop px
                if(styles[k].substr(-2) === 'px') {
                    styles[k] = styles[k].substr(0, styles[k].length -2);
                }

                if(k.indexOf('-') > 0) {
                    lang.setObject(k.replace(/-/g, '.'), styles[k], modified);
                    delete styles[k];
                }

            });

            //stupid newline escaping
            if(styles.content) {
                styles.content = styles.content.replace(/\\n/g, '\n');
            }

            modified = mixin(styles, modified); //mix back in what remains unmapped of styles to our modified ones

            modified._original = org;

            return modified;

        },


        //this will need to move out to a higher level, it will apply figlet.text() whenever the "font" or any "feglet-"
        //properties are defined
        figet: function (styles) {

            var d = new Deferred();

            if(styles.font) {
                lang.setObject('figlet.font', styles.font, styles);
            }

            if(styles.figlet && styles.content) {

                if(styles.figlet.font === '?') {

                    figlet.fonts(hitch(this, function (err, fonts) {

                        this.notice(fonts);
                        d.resolve();

                    }));

                } else {

                    figlet.text(styles.content, styles.figlet, function (err, data) {

                        if(err) {
                            d.reject(err);
                        } else {
                            styles.content = data;
                            d.resolve(data);
                        }

                    });

                }



            } else {
                d.resolve();
            }


            return d;

        }

    });

});
