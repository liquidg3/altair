define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/facades/mixin',
        'altair/modules/commandcentral/adapters/_Base',
        'dojo/node!blessed',
        'altair/Deferred'
], function (declare,
             hitch,
             mixin,
             _Base,
             blessed,
             Deferred) {

    return declare('altair/modules/commandcentral/adapters/Blessed', [_Base], {

        screen:     null,
        noticeBox:  null,
        longLabels: false,

        startup: function () {

            this.screen = blessed.screen({ autoPadding: true });

            this.screen.key(['escape', 'q', 'C-c'], function (ch, key) {
                return process.exit(0);
            });

            process.title = 'Altair:CommandCentral';


            return this.inherited(arguments);
        },

        splash: function () {

            var styles = this.styles('#splash'),
                d      = new Deferred();

            if(!styles) {
                throw "You must create a commanders/styles.json and drop in a style for #splash";
            }

            styles = mixin({
                parent:  this.screen
            }, styles);

            this.splash = blessed.box(styles);
            this.splash.focus();
            this.screen.render();


            setTimeout(hitch(this, function () {

                this.splash.setContent('');
                this.screen.render();

                d.resolve();

            }), 1500);

            return d;

        },

        /**
         * Should show a progress dialog with a message
         */
        showProgress: function (message) {

            this.progress = this.progress || blessed.loading({
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

        },

        hideProgress: function () {
            this.progress.detach();
            delete this.progress;
        },

        notice: function (str) {

            if (!this.noticeBox) {

                this.noticeBox = blessed.box({
                    left: 0,
                    bottom: 0,
                    width: "100%",
                    top: "80%",
                    content: str + "\n",
                    border: {
                        type: 'line'
                    },
                    style: {
                        fg: 'white',
                        bg: 'black'
                    }
                });


                this.noticeBox.focus();
                this.screen.append(this.noticeBox);

            } else {
                this.noticeBox.content += str + "\n";
            }

            this.screen.render();


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
                d        = new Deferred(),
                f;

            if(options.id) {
                selector += ', #' + options.id;
            }

            blessed.form(mixin({
                parent: this.screen,
                keys:   true
            }, options, this.styles(selector)));



            this.screen.render();


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
                keys = Object.keys(selectOptions),
                values = keys.map(function (key) {
                    return selectOptions[key];
                });

            options = this._normalizeOptions(options);

            if(options.id) {
                 selector += ', #' + options.id;
            }

            //defaults
            var styles = mixin({
                parent:     this.screen,
                items:      values.slice(0),
                label:      question,
                mouse:      true,
                keys:       true,
                vi:         true
            }, options, this.styles(selector));

            list = blessed.list(styles);

            list.on('select', hitch(this, function (list, selected) {
                list.detach();
                this.screen.render();
                def.resolve(keys[selected]);
            }));

            list.focus();
            this.screen.render();

            return def;
        }

    });

});
