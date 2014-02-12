/**
 * Test module
 */
define(['dojo/_base/declare',
        'altair/modules/events/mixins/_HasListenersMixin',
        'dojo/node!blessed'],

    function (declare,
              _HasListenersMixin,
              blessed) {


        return declare('altair/modules/commandcentral/CommandCentral', [_HasListenersMixin], {

            screen:   null,
            box:      null,
            count:    0,
            startup: function () {

                this.screen = blessed.screen();


                this.box = blessed.box({
                    top: 'center',
                    left: 'center',
                    width: '50%',
                    height: '50%',
                    content: 'Hello {bold}Altair{/bold}!',
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

                this.screen.append(this.box);
                this.screen.render();
                return this.inherited(arguments);
            },

            /**
             * Anytime a module starts up lets check if new commanders are registered.
             *
             * @param e
             */
            onDidStartupModule: function (e) {
                console.log('in');
                this.count++;
                this.box.content += 'new module??' + "\n";
                this.screen.render();
            }

        });
    });