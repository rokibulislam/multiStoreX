<?php
namespace MultiStoreX\Shortcodes;

/**
 * Dashboard Class
 * 
 * @package MultiStoreX
 */ 
class Dashboard {
    
    /**
     * shortcode 
     * 
     * @var string
     */ 
	protected $shortcode = 'multistorex-dashboard';

    /**
     * Constructor 
     * 
     */
	public function __construct() {

		add_shortcode( $this->shortcode, array( $this, 'render_shortcode' ) );
        
        add_action( 'page_template', array( $this, 'dashboard_template' ) );

        add_action( 'multistorex_dashboard_content_before', array( $this, 'add_dashboard_nav' ) );
	}

    /**
     * Dashboard Template 
     * 
     * @param string $page_template
     * 
     * @return string
     */ 
    public function dashboard_template( $page_template ) {

        if( wc_post_content_has_shortcode($this->shortcode) && is_user_logged_in() ) {
            $page_template = MULTISTOREX_DIR . '/templates/multistorex-content.php';
        }

        return $page_template;
    }

    /**
     * Add Dashboard Navigation
     * 
     * @return void
     */ 
    public function add_dashboard_nav() {
        multistorex_get_template_part( 'sidebar/nav' );
    }

    /**
     * Render Shortcode
     * 
     * @param array $atts
     * 
     * @return void
     */ 
	public function render_shortcode( $atts ) {
		global $wp; 

        if ( ! function_exists( 'WC' ) ) {
            // translators: 1) wooCommerce installation url
            return sprintf( __( 'Please install <a href="%s"><strong>WooCommerce</strong></a> plugin first', 'multistorex-lite' ), 'http://wordpress.org/plugins/woocommerce/' );
        }

        // if ( ! multistorex_is_user_seller( get_current_user_id() ) ) {
        //     return __( 'You have no permission to view this page', 'multistorex-lite' );
        // }

        ob_start();

        if ( isset( $wp->query_vars['products'] ) && $wp->query_vars['products'] == 'new-product' ) {

            // if ( isset( $wp->query_vars['new-product'] ) ) {
                // if ( ! current_user_can( 'multistorex_add_product' ) ) {
                //     multistorex_get_template_part( 'global/no-permission' );
                // } else {
                //     do_action( 'multistorex_render_new_product_template', $wp->query_vars );
                // }
            
            multistorex_get_template_part( 'products/new-product' );
            
            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['posts'] ) && $wp->query_vars['posts'] == 'new-post' ) {

            multistorex_get_template_part( 'posts/new-post' );
            
            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['posts'] ) ) {
            
            multistorex_get_template_part( 'posts/posts' );

            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['products'] ) ) {
            
        /*
            if ( ! current_user_can( 'multistorex_view_product_menu' ) ) {
                multistorex_get_template_part( 'global/no-permission' );
            } else {
                multistorex_get_template_part( 'products/products' );
            }
        */
            multistorex_get_template_part( 'products/products' );

            return ob_get_clean();
        }


        if ( isset( $wp->query_vars['orders'] ) ) {
           
        /* 
            if ( ! current_user_can( 'multistorex_view_order_menu' ) ) {
                multistorex_get_template_part( 'global/no-permission' );
            } else {
                multistorex_get_template_part( 'orders/orders' );
            }
        */

            multistorex_get_template_part( 'orders/orders' );

            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['withdraw'] ) ) {
            
        /*
            if ( ! current_user_can( 'multistorex_view_withdraw_menu' ) ) {
                multistorex_get_template_part( 'global/no-permission' );
            } else {
                multistorex_get_template_part( 'withdraw/withdraw' );
            }
        */
            multistorex_get_template_part( 'withdraw/withdraw' );

            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['settings'] ) ) {
            multistorex_get_template_part( 'settings/store' );
            return ob_get_clean();
        }

        if ( isset( $wp->query_vars['page'] ) ) {
           
        /* 
            if ( ! current_user_can( 'multistorex_view_overview_menu' ) ) {
                 multistorex_get_template_part( 'global/no-permission' );
            } else {
                multistorex_get_template_part( 'dashboard/dashboard' );
            }
        */

            multistorex_get_template_part( 'dashboard/dashboard' );

            return ob_get_clean();
        }
        if ( isset( $wp->query_vars['edit-account'] ) ) {
            multistorex_get_template_part( 'dashboard/edit-account' );

            return ob_get_clean();
        }

        do_action( 'multistorex_load_custom_template', $wp->query_vars );

		return ob_get_clean();
	}
}
