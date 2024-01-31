<?php

namespace MultiStoreX;

use MultiStoreX\Settings_API;

/**
 * Admin Class
 * 
 * @package MultiStoreX
 */ 
class Admin {

    private $settings_api;

	/**
	 * Constructor
	 */ 
	public function __construct() {

		$this->settings_api = new Settings_API();

		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );

		add_action( 'admin_init', [ $this, 'admin_init' ] );
	}

	/**
	 * Register Add Menu
	 * 
	 * @return void
	 */ 
	public function add_admin_menu() {
		
		$slug       = 'multistorex';
		$capability = 'manage_options';
		
		add_menu_page( __( 'Multistorex', 'multistorex' ), __( 'Multistorex', 'multistorex'), $capability, $slug, [ $this, 'dashboard' ] );
		add_submenu_page( $slug, __( 'Settings', 'multistorex' ), __( 'Settings', 'multistorex' ), $capability, 'multistorex-settings', array( $this, 'setting_page' ) );
	}

	/**
	 * Load Settings
	 * 
	 * @return void
	 */ 
	public function admin_init() {
        //set the settings
        $this->settings_api->set_sections( $this->get_settings_sections() );
        $this->settings_api->set_fields( $this->get_settings_fields() );

        //initialize settings
        $this->settings_api->admin_init();
    }

    public function get_settings_sections() {

        $sections = array(

            array(
                'id'    => 'multistorex_general',
                'title' => '',
                'name' => __( 'General Settings', 'multistorex' ),
                'icon'  => 'dashicons-admin-appearance'
            ),

            array(
                'id'    => 'multistorex_page_settings',
                'title' => '',
                'name' => __( 'Page Settings', 'multistorex' ),
                'icon'  => 'dashicons-admin-appearance'
            ),

        	array(
                'id'    => 'multistorex_selling',
                'title' => '',
                'name' => __( 'Selling Options', 'multistorex' ),
                'icon'  => 'dashicons-admin-appearance'
            ),

            // array(
            //     'id'                   => 'multistorex_privacy',
            //     'title'                => '',
            //     'icon'                 => 'dashicons-admin-appearance',
            //     'name'                 => __( 'Privacy Policy', 'multistorex' ),
            //     'description'          => __( 'Update Store Privacy Policies', 'multistorex' ),
            //     'settings_title'       => __( 'Privacy Settings', 'multistorex' ),
            //     'settings_description' => __( 'You can configure your site\'s privacy settings and policy.', 'multistorex' ),
            // ),
        );

        return apply_filters( 'contactum_settings_sections', $sections );
    }

    public function get_settings_fields() {

    	$pages_array = $this->get_post_type( 'page' );

    	$commission_types = multistorex_commission_types();

        $general_site_options = apply_filters(
            'dokan_settings_general_site_options', [
                'custom_store_url'       => [
                    'name'    => 'custom_store_url',
                    'label'   => __( 'Vendor Store URL', 'dokan-lite' ),
                    /* translators: %s: store url */
                    'desc'    => sprintf( __( 'Define the vendor store URL (%s<strong>[this-text]</strong>/[vendor-name])', 'dokan-lite' ), site_url( '/' ) ),
                    'default' => 'store',
                    'type'    => 'text',
                ]
            ]
        );

        $general_vendor_store_options = apply_filters(
            'multistorex_settings_general_vendor_store_options', [
                'store_products_per_page'            => [
                    'name'    => 'store_products_per_page',
                    'label'   => __( 'Store Products Per Page', 'multistorex-lite' ),
                    'desc'    => __( 'Set how many products to display per page on the vendor store page.', 'multistorex-lite' ),
                    'type'    => 'number',
                    'default' => '12',
                ],
            ]
        );

        $general_product_page_options = apply_filters(
            'multistorex_settings_general_product_page_options', [
                'enabled_more_products_tab' => [
                    'name'    => 'enabled_more_products_tab',
                    'label'   => __( 'Enable More Products Tab', 'multistorex-lite' ),
                    'desc'    => __( 'Enable "More Products" tab on the single product page.', 'multistorex-lite' ),
                    'type'    => 'switcher',
                    'default' => 'on',
                ],
            ]
        );

        $selling_option_commission = apply_filters(
            'multistorex_settings_selling_option_commission', [
                'commission'             => [
                    'name'        => 'commission',
                    'label'       => __( 'Commission', 'multistorex-lite' ),
                    'type'        => 'sub_section',
                    'description' => __( 'Define commission types, admin commissions, shipping and tax recipients, and more.', 'multistorex-lite' ),
                ],
                'commission_type'        => [
                    'name'    => 'commission_type',
                    'label'   => __( 'Commission Type ', 'multistorex-lite' ),
                    'desc'    => __( 'Select a commission type for vendor', 'multistorex-lite' ),
                    'type'    => 'select',
                    'options' => $commission_types,
                    'default' => 'percentage',
                    'tooltip' => __( 'Select a commission type', 'multistorex-lite' ),
                ],
                'admin_percentage'       => [
                    'name'              => 'admin_percentage',
                    'label'             => __( 'Admin Commission', 'multistorex-lite' ),
                    'desc'              => __( 'Amount you get from each sale', 'multistorex-lite' ),
                    'default'           => '10',
                    'type'              => 'price',
                    'sanitize_callback' => 'wc_format_decimal',
                ],
                'shipping_fee_recipient' => [
                    'name'    => 'shipping_fee_recipient',
                    'label'   => __( 'Shipping Fee Recipient', 'multistorex-lite' ),
                    'desc'    => __( 'Who will be receiving the shipping fees? Note that, tax fees for corresponding shipping method will not be included with shipping fees.', 'multistorex-lite' ),
                    'type'    => 'radio',
                    'options' => [
                        'seller' => __( 'Vendor', 'multistorex-lite' ),
                        'admin'  => __( 'Admin', 'multistorex-lite' ),
                    ],
                    'default' => 'seller',
                ],
                'tax_fee_recipient'      => [
                    'name'    => 'tax_fee_recipient',
                    'label'   => __( 'Product Tax Fee Recipient', 'multistorex-lite' ),
                    'desc'    => __( 'Who will be receiving the tax fees for products? Note that, shipping tax fees will not be included with product tax.', 'multistorex-lite' ),
                    'type'    => 'radio',
                    'options' => [
                        'seller' => __( 'Vendor', 'multistorex-lite' ),
                        'admin'  => __( 'Admin', 'multistorex-lite' ),
                    ],
                    'default' => 'seller',
                ],
                'shipping_tax_fee_recipient'      => [
                    'name'    => 'shipping_tax_fee_recipient',
                    'label'   => __( 'Shipping Tax Fee Recipient', 'multistorex-lite' ),
                    'desc'    => __( 'Who will be receiving the tax fees for shipping?', 'multistorex-lite' ),
                    'type'    => 'radio',
                    'options' => [
                        'seller' => __( 'Vendor', 'multistorex-lite' ),
                        'admin'  => __( 'Admin', 'multistorex-lite' ),
                    ],
                    'default' => 'seller',
                ],
            ]
        );

        $selling_option_vendor_capability = apply_filters(
            'multistorex_settings_selling_option_vendor_capability', [
                'selling_capabilities'      => [
                    'name'          => 'selling_capabilities',
                    'label'         => __( 'Vendor Capabilities', 'multistorex-lite' ),
                    'type'          => 'sub_section',
                    'description'   => __( 'Configure your multivendor site settings and vendor selling capabilities.', 'multistorex-lite' ),
                    'content_class' => 'sub-section-styles',
                ],
                'new_seller_enable_selling' => [
                    'name'    => 'new_seller_enable_selling',
                    'label'   => __( 'Enable Selling', 'multistorex-lite' ),
                    'desc'    => __( 'Immediately enable selling for newly registered vendors', 'multistorex-lite' ),
                    'type'    => 'switcher',
                    'default' => 'on',
                    'tooltip' => __( 'If checked, vendors will have permission to sell immediately after registration. If unchecked, newly registered vendors cannot add products until selling capability is activated manually from admin dashboard.', 'multistorex-lite' ),
                ],
                'one_step_product_create'     => [
                    'name'    => 'one_step_product_create',
                    'label'   => __( 'One Page Product Creation', 'multistorex-lite' ),
                    'desc'    => __( 'Add new product in single page view', 'multistorex-lite' ),
                    'type'    => 'switcher',
                    'default' => 'on',
                    'tooltip' => __( 'If disabled, instead of a single add product page it will open a pop up window or vendor will redirect to product page when adding new product.', 'multistorex-lite' ),
                ],
                'disable_product_popup'     => [
                    'name'    => 'disable_product_popup',
                    'label'   => __( 'Disable Product Popup', 'multistorex-lite' ),
                    'desc'    => __( 'Disable add new product in popup view', 'multistorex-lite' ),
                    'type'    => 'switcher',
                    'default' => 'off',
                    'show_if' => [
                        'multistorex_selling.one_step_product_create' => [ 'equal' => 'off' ],
                    ],
                    'tooltip' => __( 'If disabled, instead of a pop up window vendor will redirect to product page when adding new product.', 'multistorex-lite' ),
                ],
                'order_status_change'       => [
                    'name'    => 'order_status_change',
                    'label'   => __( 'Order Status Change', 'multistorex-lite' ),
                    'desc'    => __( 'Allow vendor to update order status', 'multistorex-lite' ),
                    'type'    => 'switcher',
                    'default' => 'on',
                    'tooltip' => __( 'Checking this will enable sellers to change the order status. If unchecked, only admin can change the order status.', 'multistorex-lite' ),
                ],
                'multistorex_any_category_selection'       => [
                    'name'    => 'multistorex_any_category_selection',
                    'label'   => __( 'Select any category', 'multistorex-lite' ),
                    'desc'    => __( 'Allow vendors to select any category while creating/editing products.', 'multistorex-lite' ),
                    'type'    => 'switcher',
                    'default' => 'off',
                ],
            ]
        );

        $settings_fields = array(
            
            // 'multistorex_general'  => array_merge(
            //     $general_site_options
            //     $general_vendor_store_options,
            //     // $general_product_page_options
            // ),
        	
            'multistorex_selling' => array(
                array(
                    'name'    => 'dashboard',
                    'label'   => __( 'Dashboard Page', '' ),
                    'desc'    => __( 'Select a page to show vendor dashboard', '' ),
                    'type'    => 'select',
                    'default' => __( '', '' ),
                    'options' => $pages_array,
                    'placeholder' => __( 'Select page', '' ),
                ),
                
                'commission_type'        => [
                    'name'    => 'commission_type',
                    'label'   => __( 'Commission Type ', 'multistorex-lite' ),
                    'desc'    => __( 'Select a commission type for vendor', 'multistorex-lite' ),
                    'type'    => 'select',
                    'options' => $commission_types,
                    'default' => 'percentage',
                    'tooltip' => __( 'Select a commission type', 'multistorex-lite' ),
                ],

                'shipping_fee_recipient' => [
                    'name'    => 'shipping_fee_recipient',
                    'label'   => __( 'Shipping Fee Recipient', 'multistorex-lite' ),
                    'desc'    => __( 'Who will be receiving the shipping fees? Note that, tax fees for corresponding shipping method will not be included with shipping fees.', 'multistorex-lite' ),
                    'type'    => 'radio',
                    'options' => [
                        'seller' => __( 'Vendor', 'multistorex-lite' ),
                        'admin'  => __( 'Admin', 'multistorex-lite' ),
                    ],
                    'default' => 'seller',
                ],

                'tax_fee_recipient'      => [
                    'name'    => 'tax_fee_recipient',
                    'label'   => __( 'Product Tax Fee Recipient', 'multistorex-lite' ),
                    'desc'    => __( 'Who will be receiving the tax fees for products? Note that, shipping tax fees will not be included with product tax.', 'multistorex-lite' ),
                    'type'    => 'radio',
                    'options' => [
                        'seller' => __( 'Vendor', 'multistorex-lite' ),
                        'admin'  => __( 'Admin', 'multistorex-lite' ),
                    ],
                    'default' => 'seller',
                ],
                
                'shipping_tax_fee_recipient'      => [
                    'name'    => 'shipping_tax_fee_recipient',
                    'label'   => __( 'Shipping Tax Fee Recipient', 'multistorex-lite' ),
                    'desc'    => __( 'Who will be receiving the tax fees for shipping?', 'multistorex-lite' ),
                    'type'    => 'radio',
                    'options' => [
                        'seller' => __( 'Vendor', 'multistorex-lite' ),
                        'admin'  => __( 'Admin', 'multistorex-lite' ),
                    ],
                    'default' => 'seller',
                ],
        	),
            
            'multistorex_page_settings' => array(     
                
                array(
                    'name'    => 'dashboard',
                    'label'   => __( 'Dashboard Page', '' ),
                    'desc'    => __( 'Select a page to show vendor dashboard', '' ),
                    'type'    => 'select',
                    'default' => __( '', '' ),
                    'options' => $pages_array,
                    'placeholder' => __( 'Select page', '' ),
                ),
                
                // array(
                //     'name'    => 'my_orders',
                //     'label'   => __( 'My Orders', '' ),
                //     'desc'    => __( 'Select a page to show my orders', '' ),
                //     'type'    => 'select',
                //     'default' => __( '', '' ),
                //     'options' => $pages_array,
                //     'placeholder' => __( 'Select page', '' ),
                // ),

                // array(
                //     'name'    => 'store_listing',
                //     'label'   => __( 'Store Listing', '' ),
                //     'desc'    => __( 'Select a page to show all stores', '' ),
                //     'type'    => 'select',
                //     'default' => __( '', '' ),
                //     'options' => $pages_array,
                //     'placeholder' => __( 'Select page', '' ),
                // ),

                // array(
                //     'name'        => 'reg_tc_page',
                //     'type'        => 'select',
                //     'desc'        => __( 'Select where you want to add Multistorex pages.', '' ),
                //     'label'       => __( 'Terms and Conditions Page', '' ),
                //     'options'     => $pages_array,
                //     'tooltip'     => __( 'Select a page to display the Terms and Conditions of your store for Vendors.', '' ),
                //     'placeholder' => __( 'Select page', '' ),
                // ),
            ),

            // 'multistorex_privacy'    => [
            //     'privacy_page'   => [
            //         'name'        => 'privacy_page',
            //         'label'       => __( 'Privacy Page', 'multistorex' ),
            //         'type'        => 'select',
            //         'desc'        => __( 'Select a page to show your privacy policy', 'multistorex' ),
            //         'placeholder' => __( 'Select page', 'multistorex' ),
            //         'options'     => $pages_array,
            //     ]
            // ],
        );

        return apply_filters( 'multistorex_settings_fields', $settings_fields );
    }

	/**
	 * Load Dashboard
	 * 
	 * @return void
	 */ 
	public function dashboard() {
		?>
		<div id="multistorex-admin-app"> </div>
		<?php
	}

	/**
	 * Load Settings Page
	 * 
	 * @return void
	 */ 
	public function setting_page() {
		?>
        <div class="wrap">
            <h1 class="wp-heading-inline"><?php esc_html_e( 'Settings', 'multistorex' ) ?></h1><br>
            <div class="multistorex-settings-wrap">
                <?php
                    $this->settings_api->show_navigation();
                    $this->settings_api->show_forms();
                ?>
            </div>
        </div>
        <?php	
	}


	/**
     * Get Post Type array
     *
     * @since 1.0
     *
     * @param string $post_type
     *
     * @return array
     */
    public function get_post_type( $post_type ) {
        $pages_array = [];
        $pages       = get_posts(
            [
                'post_type'   => $post_type,
                'numberposts' => - 1,
            ]
        );

        if ( $pages ) {
            foreach ( $pages as $page ) {
                $pages_array[ $page->ID ] = $page->post_title;
            }
        }

        return $pages_array;
    }
}