define(['dojo/_base/declare',
        'altair/facades/hitch',
        'dojo/Deferred',
        'altair/modules/commandcentral/adapters/_Base',
        'dojo/node!blessed'
], function (declare,
             hitch,
             Deferred,
             _Base,
             blessed) {


    return declare('altair/modules/commandcentral/adapters/Blessed', [_Base], {

        screen: null,
        noticeBox: null,

        startup: function () {

            this.screen = blessed.screen({ autoPadding: true });

            this.screen.key(['escape', 'q', 'C-c'], function (ch, key) {
                return process.exit(0);
            });

            process.title = 'Altair:CommandCentral';


            return this.inherited(arguments);
        },

        splash: function () {

            this.splash = this.splash ||  blessed.box({
                top: 'center',
                left: 'center',
                width: '50%',
                parent: this.screen,
                height: '50%',
                content: 'Welcome to {bold}Altair{/bold}!',
                tags: true,
                border: {
                    type: 'line'
                },
                style: {
                    fg: 'white',
                    bg: 'magenta',
                    border: {
                        fg: '#f0f0f0'
                    },
                    hover: {
                        bg: 'green'
                    }
                }
            });

        },

        /**
         * Should show a progress dialog with a amessage
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

        select: function (question, options) {

            var def = new Deferred();


            var list = blessed.list({
                align: 'center',
                mouse: true,
                parent: this.screen,
                fg: 'blue',
                bg: 'default',
                border: {
                    type: 'ascii',
                    fg: 'default',
                    bg: 'default'
                },
                width: '50%',
                height: '50%',
                top: 'center',
                left: 'center',
                selectedBg: 'green',
                items: [
                    'one',
                    'two',
                    'three',
                    'four',
                    'five',
                    'six',
                    'seven',
                    'eight',
                    'nine',
                    'ten'
                ],
                scrollbar: {
                    ch: ' ',
                    track: {
                        bg: 'yellow'
                    },
                    style: {
                        inverse: true
                    }
                }
            });

            return def;
        }

    });

});
