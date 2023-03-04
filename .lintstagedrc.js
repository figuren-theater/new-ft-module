module.exports = {
	"composer.*": () => "vendor/bin/composer-normalize",
	"package.json": [
		"npm run lint:pkg-json"
	],
	"**/*.js": [
		"npm run lint:js"
	],
	"**/!(plugin).php": [
		"npm run lint:php"
	],
	"plugin.php": [
		"vendor/bin/phpcs --runtime-set testVersion 7.1-"
	]
};
