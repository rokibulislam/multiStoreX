(function($) {

var Multistorex_Vendor_Registration = {

    init: function() {
        var form = $('form.register');

        // bind events
        $( '.user-role input[type=radio]', form ).on( 'change', this.showSellerForm );
        $( document ).on( 'multistorex_event_seller_registration_form', this.showSellerForm );
        $( '.tc_check_box', form ).on( 'click', this.onTOC );
        $( '#shop-phone', form ).on( 'keydown', multistorex_sanitize_phone_number );
        $( '#company-name', form ).on( 'focusout', this.generateSlugFromCompany );

        $( '#seller-url', form ).on( 'keydown', this.constrainSlug );
        $( '#seller-url', form ).on( 'keyup', this.renderUrl );
        $( '#seller-url', form ).on( 'focusout', this.checkSlugAvailability );

        this.validationLocalized();
        this.handlePasswordStrengthObserver();
        // this.validate(this);
        $( document ).trigger( 'multistorex_event_seller_registration_form' );
    },

    validate: function(self) {

        $('form.register').validate({
            errorPlacement: function(error, element) {
                var form_group = $(element).closest('.form-group');
                form_group.addClass('has-error').append(error);
            },
            success: function(label, element) {
                $(element).closest('.form-group').removeClass('has-error');
            },
            submitHandler: function(form) {
                form.submit();
            }
        });
    },

    showSellerForm: function() {
        var value = $(this).val();

        if ( value === 'seller') {
            $('.show_if_seller').find( 'input, select' ).removeAttr( 'disabled' );
            $('.show_if_seller').slideDown();

            if ( $( '.tc_check_box' ).length > 0 ) {
                $('button[name=register]').attr('disabled','disabled');
            }
            $('.user-role .multistorex-role-seller').prop("checked",true);
        } else {
            $('.show_if_seller').find( 'input, select' ).attr( 'disabled', 'disabled' );
            $('.show_if_seller').slideUp();

            if ( $( '.tc_check_box' ).length > 0 ) {
                $( 'button[name=register]' ).removeAttr( 'disabled' );
            }
            $('.user-role .multistorex-role-customer').prop("checked",true);
        }
    },

    onTOC: function() {
        var chk_value = $( this ).val();

        if ( $( this ).prop( "checked" ) ) {
            $( 'input[name=register]' ).removeAttr( 'disabled' );
            $( 'button[name=register]' ).removeAttr( 'disabled' );
            $( 'input[name=multistorex_migration]' ).removeAttr( 'disabled' );
        } else {
            $( 'input[name=register]' ).attr( 'disabled', 'disabled' );
            $( 'button[name=register]' ).attr( 'disabled', 'disabled' );
            $( 'input[name=multistorex_migration]' ).attr( 'disabled', 'disabled' );
        }
    },

    generateSlugFromCompany: function() {
        var value = getSlug( $(this).val() );

        $('#seller-url').val(value);
        $('#url-alart').text( value );
        $('#seller-url').focus();
    },

    constrainSlug: function(e) {
        var text = $(this).val();

        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 91, 109, 110, 173, 189, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                return;
        }

        if ((e.shiftKey || (e.keyCode < 65 || e.keyCode > 90) && (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) ) {
            e.preventDefault();
        }
    },

    checkSlugAvailability: function() {
        var self = $(this),
            data = {
                action : 'shop_url',
                url_slug : self.val(),
                _nonce : multistorex.nonce,
            };

        if ( self.val() === '' ) {
            return;
        }

        var row = self.closest('.form-row');
        row.block({ message: null, overlayCSS: { background: '#fff url(' + multistorex.ajax_loader + ') no-repeat center', opacity: 0.6 } });

        $.post( multistorex.ajaxurl, data, function(resp) {

            if ( resp.success === true ) {
                $('#url-alart').removeClass('text-danger').addClass('text-success');
                $('#url-alart-mgs').removeClass('text-danger').addClass('text-success').text(multistorex.seller.available);
                $('.woocommerce-form-register__submit').prop('disabled', false);
            } else {
                $('#url-alart').removeClass('text-success').addClass('text-danger');
                $('#url-alart-mgs').removeClass('text-success').addClass('text-danger').text(multistorex.seller.notAvailable);
                $('.woocommerce-form-register__submit').prop('disabled', true);
            }

            row.unblock();

        } );
    },

    renderUrl: function() {
        $('#url-alart').text( $(this).val() );
    },

    validationLocalized: function() {
        var multistorex_messages = MultistorexValidateMsg;

        multistorex_messages.maxlength   = $.validator.format( multistorex_messages.maxlength_msg );
        multistorex_messages.minlength   = $.validator.format( multistorex_messages.minlength_msg );
        multistorex_messages.rangelength = $.validator.format( multistorex_messages.rangelength_msg );
        multistorex_messages.range       = $.validator.format( multistorex_messages.range_msg );
        multistorex_messages.max         = $.validator.format( multistorex_messages.max_msg );
        multistorex_messages.min         = $.validator.format( multistorex_messages.min_msg );

        $.validator.messages = multistorex_messages;
    },

    handlePasswordStrengthObserver: function() {
        // Identify the password input element to observe.
        const elementToObserve  = document.querySelector( '.woocommerce-form-register .password-input' ),
              AllowedClassNames = [ 'good', 'strong' ];

        // If registration password input field is not exists.
        if ( ! elementToObserve ) {
            return;
        }

        // Create a new instance of `MutationObserver` named `observer`.
        const observer = new MutationObserver( ( mutationList, observer ) => {
            for ( const mutation of mutationList ) {
                // Check if the mutation element class list contains at least an allowed class names.
                if ( AllowedClassNames.some( className => mutation.target.classList.contains( className ) ) ) {
                    this.ensureShopSlugAvailability();
                }
            }
        });

        // Call `observe()` on that MutationObserver instance.
        observer.observe( elementToObserve, { subtree: true, childList: true } );
    },

    ensureShopSlugAvailability: function() {
        const slugAvailabilityStatus = $( '#url-alart-mgs' ).hasClass( 'text-success' ),
              registrationRoleInput  = $( '.vendor-customer-registration input[name="role"]:checked' ),
              submitButton           = $( '.woocommerce-form-register__submit' );

        // Check if the registration role is `seller`.
        if ( 'seller' !== registrationRoleInput.val() ) {
            return;
        }

        // Enable/disable submit button based on shop slug availability.
        if ( slugAvailabilityStatus ) {
            submitButton.prop( 'disabled', false );
        } else {
            submitButton.prop( 'disabled', true );
        }
    }
};

// boot the class onReady
$(function() {
    window.Multistorex_Vendor_Registration = Multistorex_Vendor_Registration;
    window.Multistorex_Vendor_Registration.init();

    $('.show_if_seller').find( 'input, select' ).attr( 'disabled', 'disabled' );

    // trigger change if there is an error while registering
    var shouldTrigger = $( '.woocommerce ul' ).hasClass( 'woocommerce-error' ) && ! $( '.show_if_seller' ).is( ':hidden' );

    if ( shouldTrigger ) {
        var form = $('form.register');

        $( '.user-role input[type=radio]', form ).trigger('change');
    }

    // disable migration button if checkbox isn't checked
    if ( $( '.tc_check_box' ).length > 0 ){
        $( 'input[name=multistorex_migration]' ).attr( 'disabled', 'disabled' );
        $( 'input[name=register]' ).attr( 'disabled', 'disabled' );
    }
});

})(jQuery);