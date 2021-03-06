define(['jquery', 'jquery-ui', 'bootstrap-dialog', 'i18n/fr_FR', 'jquery-ui-widget-card-toolbox'], function(
    $, ui, BootstrapDialog, lang, toolbox
) {
    $.widget( "jtf.cardWidget", {
        options: {
            validSelector: '.card-valid',
            draftSelector: '.card-draft',
        },
        _create: function() {
            this.valid = this.element.children(this.options.validSelector).first();
            this.draft = this.element.children(this.options.draftSelector).first();

            this.toolbox = $('<div>')
                .addClass('card-toolbox')
                .cardToolboxWidget({
                    hide_validdate_action: !this.element.data('validate-url')
                })
                ;

            if (this._hasDraft()) {
                this.toolbox
                    .appendTo(this.element)
                    .cardToolboxWidget('toggleStatus', 'draft', this._isDraftValidationIsValid())
                    ;

                if (!this._isDraftValidationIsValid()) {
                    this.toolbox.cardToolboxWidget('disableValidation');
                }

                if(!this._hasValid()) {
                    this.toolbox.cardToolboxWidget('disableToggleValid');
                }
            }

            this.enable();
        },
        enable: function() {
            this._super();

            this.toolbox.cardToolboxWidget('enable');

            if (this._enableToggle) {
                this._on(this.toolbox, {
                    'card_toolbox_show_draft': '_showDraft',
                    'card_toolbox_show_valid': '_showValid',
                    'card_toolbox_validate': '_confirmValidation'
                });
            }
        },
        disable: function() {
            this._super();

            this.toolbox.cardToolboxWidget('disable');

            this._off(this.toolbox, 'showDraft showValid');
        },
        _destroy: function() {
            this.disable();

            this.toolbox.remove();

            this.valid = null;
            this.draft = null;
        },
        _hasDraft: function() {
            return this.draft.length > 0;
        },
        _hasValid: function() {
            return this.valid.length > 0;
        },
        _enableToggle: function() {
            return this._hasDraft() && this._hasValid();
        },
        _showDraft: function(event) {
            this.draft.show();
            this.valid.hide();
            this.toolbox.cardToolboxWidget('toggleStatus', 'draft', this._isDraftValidationIsValid());
        },
        _showValid: function(event) {
            this.draft.hide();
            this.valid.show();
            this.toolbox.cardToolboxWidget('toggleStatus', 'valid', this._isValidValidationIsValid());
        },
        _isDraftValidationIsValid: function() {
            if (!this._hasDraft()) {
                return false;
            }
            return this.draft.data('validationStatus') == '0';
        },
        _isValidValidationIsValid: function() {
            if (!this._hasValid()) {
                return false;
            }
            return this.valid.data('validationStatus') == '0';
        },
        _confirmValidation: function(event) {
            var that = this;

            if (!this.element.data('validate-url')) {
                console.log('jtf.cardWidget validate-url unknown !');
                return ;
            }

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_WARNING,
                title: lang.card.validation.confirm_title,
                message: lang.card.validation.confirm,
                btnCancelLabel: lang.card.validation.confirm_cancel,
                btnOKLabel: lang.card.validation.confirm_ok,
                btnOKClass: 'btn-warning',
                callback: function(result){
                    if(result) {
                        if (that.jqXHR) {
                            that.jqXHR.abort();
                        }

                        that.jqXHR = $.ajax({
                            method: 'POST',
                            url: that.element.data('validate-url')
                         });

                        that.jqXHR.done(function(data, textStatus, jqXHR) {
                            that._showDraft();
                            that._destroy();

                            BootstrapDialog.alert({
                                type: BootstrapDialog.TYPE_SUCCESS,
                                title: lang.card.validation.success_title,
                                message: lang.card.validation.success
                            });
                        });
                        that.jqXHR.fail(function(jqXHR, textStatus, errorThrown) {
                            BootstrapDialog.alert({
                                type: BootstrapDialog.TYPE_DANGER,
                                title: lang.card.validation.error_title,
                                message: lang.card.validation.error
                            });
                        });
                    }
                }
            });
        }
    });
});
