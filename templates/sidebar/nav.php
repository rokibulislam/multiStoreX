<?php
	$home_url     = home_url();
	$active_class = ' class="active"'
?>

<div class="multistorex-dash-sidebar">
    <?php
    global $allowedposttags;

    // These are required for the hamburger menu.
    if ( is_array( $allowedposttags ) ) {
        $allowedposttags['input'] = [ // phpcs:ignore
            'id'      => [],
            'type'    => [],
            'checked' => [],
        ];
    }

    echo wp_kses( multistorex_dashboard_nav(), $allowedposttags );
    ?>
</div>
