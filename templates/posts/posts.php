<div class="multistorex">

	<?php do_action( 'multistorex_dashboard_content_before' ); ?>

	<div class="multistorex-content">
		
		<h2 class="multistorex-title"> Post List </h2>

		<?php 

	        $new_product_url = add_query_arg(
	            [
	                '_multistorex_add_post_nonce' => wp_create_nonce( 'multistorex_add_post_nonce' ),
	            ],
	            multistorex_get_navigation_url( 'new-post' )
	        );
       	?>

        <a href="<?php echo esc_url( $new_product_url ); ?>" class="multistorex-btn multistorex-btn-theme multistorex-add-new-post'; ?>">
            <i class="fas fa-briefcase">&nbsp;</i>
            <?php esc_html_e( 'Add new post', 'multistorex-lite' ); ?>
        </a>

	</div>

	<?php do_action( 'multistorex_dashboard_content_after' ); ?>

</div>