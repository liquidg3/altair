define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/facades/mixin',
        'dojo/Deferred',
        'altair/modules/commandcentral/adapters/_Base',
        'dojo/node!blessed'
], function (declare,
             hitch,
             mixin,
             Deferred,
             _Base,
             blessed) {


    return declare('altair/modules/commandcentral/adapters/Blessed', [_Base], {

        screen:     null,
        noticeBox:  null,

        startup: function () {

            this.screen = blessed.screen({ autoPadding: true });

            this.screen.key(['escape', 'q', 'C-c'], function (ch, key) {
                return process.exit(0);
            });

            process.title = 'Altair:CommandCentral';


            return this.inherited(arguments);
        },

        splash: function () {

            var styles = this.styles('#splash');

            if(!styles) {
                throw "You must create a commanders/styles.json and drop in a style for #splash";
            }

            styles = mixin({
                content: 'Splash Screen',
                parent:  this.screen
            }, styles);

            this.splash = blessed.box(styles);
            this.screen.render();

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

        select: function (question, options, id) {

            var def = new Deferred(),
                keys = Object.keys(options),
                values = keys.map(function (key) {
                    return options[key];
                });

            //defaults
            var styles = mixin({
                parent: this.screen,
                items: keys,
                content: question,
                width: '50%',
                height: '50%',
                top: 'center',
                left: 'center',
                align: 'center',
                fg: 'blue',
                border: {
                    type: 'line'
                },
                selectedBg: 'green',
                mouse: true,
                keys: true,
                vi: true
            }, this.styles('select, #' + id));

            var list = blessed.list(styles);
            list.focus();
            this.screen.render();

            return def;
        }

    });

});
