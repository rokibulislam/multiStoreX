// Multistorex Login Form Popup
(function($) {
    multistorex.login_form_popup = {
        form_html : '',
        form_title: '',

        init: function () {
            $( 'body' ).on( 'multistorex:login_form_popup:show', this.get_form );
            $( 'body' ).on( 'submit', '#multistorex-login-form-popup-form', this.submit_form );
            $( 'body' ).on( 'multistorex:login_form_popup:working', this.working );
            $( 'body' ).on( 'multistorex:login_form_popup:done_working', this.done_working );
        },

        get_form: function (e, options) {
            if ( multistorex.login_form_popup.form_html ) {
                multistorex.login_form_popup.show_popup();
                return;
            }

            options = $.extend(true, {
                nonce: multistorex.nonce,
                action: 'multistorex_get_login_form'
            }, options );

            $( 'body' ).trigger( 'multistorex:login_form_popup:fetching_form' );

            $.ajax( {
                url: multistorex.ajaxurl,
                method: 'get',
                dataType: 'json',
                data: {
                    _wpnonce: options.nonce,
                    action: options.action
                }
            } ).done( function ( response ) {
                multistorex.login_form_popup.form_html  = response.data.html;
                multistorex.login_form_popup.form_title = response.data.title;
                multistorex.login_form_popup.show_popup();
                $( 'body' ).trigger( 'multistorex:login_form_popup:fetched_form' );
            } );
        },

        show_popup: function () {
            $( 'body' ).append( '<div id="multistorex-modal-login-form-popup"></div>' );

            const modal = $( '#multistorex-modal-login-form-popup' ).iziModal( {
                headerColor : multistorex.modal_header_color,
                overlayColor: 'rgba(0, 0, 0, 0.8)',
                width       : 690,
                onOpened    : () => {
                    $( 'body' ).trigger( 'multistorex:login_form_popup:opened' );
                }
            } );
            modal.iziModal( 'setTitle', multistorex.login_form_popup.form_title );
            modal.iziModal( 'setContent', multistorex.login_form_popup.form_html );
            modal.iziModal( 'open' );
        },

        submit_form: function ( e ) {
            e.preventDefault();

            var form_data = $( this ).serialize();
            var error_section = $( '.multistorex-login-form-error', '#multistorex-login-form-popup-form' );

            error_section.removeClass( 'has-error' ).text('');

            $( 'body' ).trigger( 'multistorex:login_form_popup:working' );

            $.ajax( {
                url: multistorex.ajaxurl,
                method: 'post',
                dataType: 'json',
                data: {
                    _wpnonce: multistorex.nonce,
                    action: 'multistorex_login_user',
                    form_data: form_data
                }
            } ).done( function ( response ) {
                $( 'body' ).trigger( 'multistorex:login_form_popup:logged_in', response );
                $( '#multistorex-login-form-popup' ).iziModal( 'close' );
            } ).always( function () {
                $( 'body' ).trigger( 'multistorex:login_form_popup:done_working' );
            } ).fail( function ( jqXHR ) {
                if ( jqXHR.responseJSON && jqXHR.responseJSON.data && jqXHR.responseJSON.data.message ) {
                    error_section.addClass( 'has-error' ).text( jqXHR.responseJSON.data.message );
                }
            } );
        },

        working: function () {
            $( 'fieldset', '#multistorex-login-form-popup-form' ).prop( 'disabled', true );
            $( '#multistorex-login-form-submit-btn' ).addClass( 'multistorex-hide' );
            $( '#multistorex-login-form-working-btn' ).removeClass( 'multistorex-hide' );
        },

        done_working: function () {
            $( 'fieldset', '#multistorex-login-form-popup-form' ).prop( 'disabled', false );
            $( '#multistorex-login-form-submit-btn' ).removeClass( 'multistorex-hide' );
            $( '#multistorex-login-form-working-btn' ).addClass( 'multistorex-hide' );
        }
    };

    multistorex.login_form_popup.init();
})(jQuery);