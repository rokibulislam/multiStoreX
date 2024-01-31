<?php
namespace MultiStoreX;

/**
 * Order Class
 * 
 * @package MultiStoreX
 */ 
class Order {

	/**
	 * Constructor
	 */ 
	public function __construct() {

	}

	/**
	 * 
	 * @param \WC_Order $order
	 * 
	 * @return void
	 */
	public function createTaxes( $order ) {

	}

	/**
	 * 
	 * @param \WC_Order $order
	 * 
	 * @return void
	 */
	public function createShipping( $order ) {

	}

	/**
	 * 
	 * @param \WC_Order $order
	 * 
	 * @return void
	 */
	public function createCoupon( $order ) {

	}

	/**
	 * 
	 * @param \WC_Order $order
	 * 
	 * @return void
	 */
	public function createLineItems( $order ) {

	}
}
