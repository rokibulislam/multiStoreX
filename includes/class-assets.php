<?php
namespace MultiStoreX;

/**
 * Assets Class
 * 
 * @package Assets
 */ 
class Assets {

	/**
	 * Construct
	 */ 
	public function __construct() {
		add_action( 'init', [ $this, 'register_all_scripts' ], 10 );

		if ( is_admin() ) {
            add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_scripts' ], 10 );
        } else {
            add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_front_scripts' ] );
        }
	}

	/**
	 * Register all MultiStoreX scripts and styles
	 * 
	 * @return void
	 */ 
	public function register_all_scripts() {
        $styles  = $this->get_styles();
        $scripts = $this->get_scripts();

        $this->register_styles( $styles );
        $this->register_scripts( $scripts );

        do_action( 'multistorex_register_scripts' );
    }

    /**
     * Register all MultiStoreX styles
     * 
     * @return array
     */ 
	public function get_styles() {
		$styles = array(
            'multistorex-style' => array(
                'src'     => MULTISTOREX_PLUGIN_ASSEST . '/css/style.css',
                'version' => filemtime( MULTISTOREX_DIR . '/assets/css/style.css' ),
			),
		);

		return $styles;
	}

	/**
	 * Get registered scripts
	 * 
	 * @return array
	 */ 
	public function get_scripts() {

		$asset_url  = MULTISTOREX_PLUGIN_ASSEST;
		$asset_path = MULTISTOREX_DIR . '/assets/';

		$scripts = array(
            
            'multistorex-seller-registration' => [
                'src'     => $asset_url . '/js/seller-registration.js',
                'deps'    => [ 'jquery' ],
                'version' => filemtime( $asset_path . 'js/seller-registration.js' ),
            ],

            'multistorex-login-form-popup'    => [
                'src'     => $asset_url . '/js/login-form-popup.js',
                'deps'    => [],
                'version' => filemtime( $asset_path . 'js/login-form-popup.js' ),
            ],
		);

		return $scripts;
	}

	/**
	 * Register scripts
	 * 
	 * @param array $scripts
	 * 
	 * @return void
	 */ 
	public function register_scripts( $scripts ) {
        foreach ( $scripts as $handle => $script ) {
            $deps      = isset( $script['deps'] ) ? $script['deps'] : false;
            $in_footer = isset( $script['in_footer'] ) ? $script['in_footer'] : true;
            $version   = isset( $script['version'] ) ? $script['version'] : MULTISTOREX_PLUGIN_VERSION;

            wp_register_script( $handle, $script['src'], $deps, $version, $in_footer );
        }
	}

	/**
	 * Register styles
	 * 
	 * @param array $styles
	 * 
	 * @return void
	 */ 
	public function register_styles( $styles ) {
        foreach ( $styles as $handle => $style ) {
            $deps    = isset( $style['deps'] ) ? $style['deps'] : false;
            $version = isset( $style['version'] ) ? $style['version'] : MULTISTOREX_PLUGIN_VERSION;

            wp_register_style( $handle, $style['src'], $deps, $version );
        }
	}

	/**
	 * Enqueue the scripts
	 * 
	 * @param array $scripts
	 * 
	 * @return void
	 */ 
	public function enqueue_scripts( $scripts ) {
        foreach ( $scripts as $handle => $script ) {
            wp_enqueue_script( $handle );
        }
	}

	/**
	 * Enqueue the styles
	 * 
	 * @param array $styles
	 * 
	 * @return void
	 */ 
	public function enqueue_styles( $styles ) {
        
        foreach ( $styles as $handle => $script ) {
            wp_enqueue_style( $handle );
        }
	}

	/**
	 * Enqueue admin the scripts
	 * 
	 * @param string $hook
	 * 
	 * @return void
	 */ 
	public function enqueue_admin_scripts( $hook ) {
		global $post, $wp_version, $typenow;

        // load vue app inside the parent menu only
        if ( 'toplevel_page_multistorex' === $hook ) {

        }

        do_action( 'multistorex_enqueue_admin_scripts', $hook );
	}

	/**
	 * Enqueue frontend the styles
	 * 
	 * @return void
	 */ 
	public function enqueue_front_scripts() {
		wp_enqueue_style( 'multistorex-style' );

		if ( is_account_page() && ! is_user_logged_in() ) {
            wp_enqueue_script( 'multistorex-seller-registration' );
        }

        do_action( 'multistorex_enqueue_scripts' );
	}
}
