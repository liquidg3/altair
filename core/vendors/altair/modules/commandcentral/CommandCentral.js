/**
 * Test module
 */
define(['dojo/_base/declare',
        'altair/modules/adapters/mixins/_HasAdaptersMixin',
        'altair/modules/events/mixins/_HasListenersMixin',
        'altair/facades/hitch',
        'altair/Lifecycle'],

    function (declare,
              _HasAdaptersMixin,
              _HasListenersMixin,
              hitch) {


        return declare('altair/modules/commandcentral/CommandCentral', [_HasAdaptersMixin, _HasListenersMixin], {

            /**
             * Set the selected terminal interface adapter
             *
             * @returns {*}
             */
            startup: function () {

                if(!process.stdin.isTTY || !process.stdout.isTTY) {
                    this._selectedAdapter = 'adapters/Prompt';
                } else {
                    this._selectedAdapter = 'adapters/Blessed';
                }

                return this.inherited(arguments);

            },

            /**
             * Anytime a module starts up lets check if new commanders are registered.
             *
             * @param e
             */
            onDidStartupModule: function (e) {
                this.adapter().notice('Started ' + e.get('module').name);
            }

        });
    });