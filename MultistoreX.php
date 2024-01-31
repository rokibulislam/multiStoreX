<?php

/**
 * Plugin Name: MultiStoreX
 * Description: Description
 * Plugin URI: http://#
 * Author: Author
 * Author URI: http://#
 * Version: 1.0.0
 * License: GPL2
 * Text Domain: text-domain
 * Domain Path: domain/path
 */

/*
    Copyright (C) Year  Author  Email

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as
    published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

/**
 * MultiStoreX class
 *
 * @class MultiStoreX The class that holds the entire MultiStoreX plugin
 *
 */

final class MultiStoreX {

    /**
     * WooCommerce version.
     *
     * @var string
     */
	public $version = '1.0.0';

    /**
     * Holds various class instances
     *
     * @var array
     */
	private $container = array();

    /**
     * The single instance of the class.
     *
     * @var MultiStoreX
     */
	private static $instance = null;


    /**
     * Constructor
     */
	private function __construct() {
        $this->define_constants();
        $this->includes();

		register_activation_hook( __FILE__, array( $this, 'activate' ) );
        register_deactivation_hook( __FILE__, array( $this, 'deactivate' ) );


        add_action( 'woocommerce_loaded', array( $this, 'init_plugin' ) );
        add_action( 'woocommerce_flush_rewrite_rules', array( $this, 'flush_rewrite_rules' ) );
	}

    /**
     * Initializes the MultiStoreX class
     * 
     * @return object
     */ 
	public static function init() {
        if ( self::$instance === null ) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Magic Method getter to bypass referencing objects
     * 
     * @return void
     */ 
    public function __get( $prop ) {
        if ( array_key_exists( $prop, $this->container ) ) {
            return $this->container[ $prop ];
        }
    }

    /**
     * Activation function
     * 
     * @return @void
     */ 
    public function activate() {
        $installer = new MultiStoreX\Installer();
        $installer->create_setup();
        $this->flush_rewrite_rules();
    }

    /**
     * Deactivation function
     * 
     * @return void
     */ 
    public function deactivate() {

    }

    /**
     *  Define Constants
     * 
     * @return void
     */ 
    public function define_constants() {
    	define( 'MULTISTOREX_PLUGIN_VERSION', $this->version );
        define( 'MULTISTOREX_FILE', __FILE__ );
        define( 'MULTISTOREX_DIR', __DIR__ );
        define( 'MULTISTOREX_INC_DIR', __DIR__ . '/includes' );
        define( 'MULTISTOREX_PLUGIN_ASSEST', plugins_url( 'assets', __FILE__ ) );
    }

    /**
     * Load the plugin after Woocommerce is loaded
     * 
     * @return void
     */ 
    public function init_plugin() {
    	$this->init_classes();
        $this->init_hooks();
    }

    /**
     * 
     * 
     */ 
    public function woocommerce_not_loaded() {

    }

    /**
     * Flush rewrite rules after multistorex is activated or woocommerce is activated
     * 
     * @return void
     */ 
    public function flush_rewrite_rules() {
        
        // fix rewrite rules
        if ( ! isset( $this->container['rewrite'] ) ) {
            $this->container['rewrite'] = new MultiStoreX\Rewrites();
        }

        $this->container['rewrite']->register_rule();
        
        flush_rewrite_rules();
    }

    /**
     * Include all the required files
     * 
     * @return void
     */
    public function includes() {
        require_once MULTISTOREX_INC_DIR . '/Admin/class-admin.php';
        require_once MULTISTOREX_INC_DIR . '/Installer/class-installer.php';
        require_once MULTISTOREX_INC_DIR . '/Order/class-order.php';
        require_once MULTISTOREX_INC_DIR . '/Product/class-product.php';
        require_once MULTISTOREX_INC_DIR . '/Product/class-product-template.php';
        require_once MULTISTOREX_INC_DIR . '/Shortcodes/class-dashboard.php';
        require_once MULTISTOREX_INC_DIR . '/class-registration.php';

        require_once MULTISTOREX_INC_DIR . '/class-ajax.php';
        require_once MULTISTOREX_INC_DIR . '/class-assets.php';
        require_once MULTISTOREX_INC_DIR . '/class-rewrite.php';
    	
        require_once MULTISTOREX_INC_DIR . '/functions.php';
        require_once MULTISTOREX_INC_DIR . '/template-tags.php';

        require_once MULTISTOREX_INC_DIR . '/wc-functions.php';
        require_once MULTISTOREX_INC_DIR . '/wc-template.php';

        require_once MULTISTOREX_INC_DIR . '/class-settings-api.php';
    }

    /**
     * Init all the classes
     * 
     * @return void
     */ 
    public function init_classes() {
        new MultiStoreX\Admin();
        new MultiStoreX\Order();
        new MultiStoreX\Product();

        new MultiStoreX\Product\ProductTemplate();
        
        $this->container['assets']       = new MultiStoreX\Assets();
        $this->container['ajax']         = new MultiStoreX\Ajax();
        $this->container['shortcodes']   = new MultiStoreX\Shortcodes\Dashboard();
        $this->container['registration'] = new MultiStoreX\Registration();

        if ( ! isset( $this->container['rewrite'] ) ) {
            $this->container['rewrite'] = new MultiStoreX\Rewrites();
        }
    }

    /**
     * Hook into actions and filters.
     * 
     * @return void
     */
    public function init_hooks() {
        add_action( 'init', array( $this, 'localization_setup' ) );
        add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), array( $this, 'plugin_action_links' ) );
    }

    /**
     * Initialize plugin for localization
     *
     * @uses load_plugin_textdomain()
     */
    public function localization_setup() {
        load_plugin_textdomain( 'multistorex', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
    }

    /**
     * Plugin action links
     *
     * @param array $links
     *
     * @return array
     */
    public function plugin_action_links( $links ) {
        $links[] = '<a href="' . admin_url( 'admin.php?page=multistorex#/settings' ) . '">' . __( 'Settings', 'multistorex' ) . '</a>';

        return $links;
    }

    /**
     * Get the plugin path.
     * 
     * @return string
     */ 
    public function plugin_path() {
        return untrailingslashit( plugin_dir_path( __FILE__ ) );
    }

    /**
     * Get the template path.
     * 
     * @return string
     */ 
    public function template_path() {
        return apply_filters( 'multistorex_template_path', 'multistorex/' );
    }
}


/**
 * Load Multistorx Plugin
 *
 * @return MultiStoreX
 */
function multistorex() {
    return MultiStoreX::init();
}

multistorex();