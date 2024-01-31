<?php
namespace MultiStoreX;

/**
 * OrderTemplate Class
 * 
 * @package MultiStoreX
 */
class OrderTemplate {

	/**
	 * Constructor
	 */ 
	public function __construct() {
		add_action( 'template_redirect', array( $this, 'handle_order_export' ) );
	}

	/**
	 * Handle Order Export
	 * 
	 * @return void
	 */
	public function handle_order_export() {

	}
}