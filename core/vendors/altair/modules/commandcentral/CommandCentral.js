/**
 * Test module
 */
define(['dojo/_base/declare',
        'altair/modules/adapters/mixins/_HasAdaptersMixin',
        'altair/facades/hitch',
        'altair/Lifecycle'],

    function (declare,
              _HasAdaptersMixin,
              blessed,
              Lifecycle) {


        return declare('altair/modules/commandcentral/CommandCentral', [_HasAdaptersMixin, Lifecycle], {

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
                this.adapter();
            }

        });
    });