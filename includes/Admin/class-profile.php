<?php 
namespace MultiStoreX;

/**
 * UserProfile Class
 * 
 * @package MultiStoreX
 */ 
class UserProfile {

	/**
	 * Constructor
	 */
	public function __construct() {
		
		add_action( 'show_user_profile', array( $this, 'add_meta_fields' ), 20 );
        add_action( 'edit_user_profile', array( $this, 'add_meta_fields' ), 20 );

        add_action( 'personal_options_update', array( $this, 'save_meta_fields' ) );
        add_action( 'edit_user_profile_update', array( $this, 'save_meta_fields' ) );

        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	/**
     * save user data
     *
     * @param int $user_id
     *
     * @return void
     */
    public function add_meta_fields( $user_id ) {

    }

   	/**
     * Add fields to user profile
     *
     * @param \WP_User $user
     *
     * @return void|false
     */
    public function save_meta_fields( $user ) {

    }


	/**
     * Enqueue Script in admin profile
     *
     * @param  string $page
     *
     * @return void
     */
    public function enqueue_scripts( $page ) {

    }
}
