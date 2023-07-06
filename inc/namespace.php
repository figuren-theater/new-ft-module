<?php
/**
 * Figuren_Theater project_name.
 *
 * @package figuren-theater/project_urlname
 */

namespace Figuren_Theater\project_name;

use Altis;

/**
 * Register module.
 */
function register() {

	$default_settings = [
		'enabled' => true, // Needs to be set.
	];
	$options = [
		'defaults' => $default_settings,
	];

	Altis\register_module(
		'project_urlname',
		DIRECTORY,
		'project_name',
		$options,
		__NAMESPACE__ . '\\bootstrap'
	);
}

/**
 * Bootstrap module, when enabled.
 */
function bootstrap() {

	// Automatically load Plugins.
	// phpcs:ignore
	// ...\bootstrap();

	// Load 'Best practices'.
	// phpcs:ignore
	// ...\bootstrap();
}
