/* eslint-env node */
/* jshint node:true */
/* eslint-disable camelcase, no-console, no-param-reassign */

module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// Clean up the build.
		clean: {
			build: {
				src: ['build'],
			},
		},

		// Shell actions.
		shell: {
			options: {
				stdout: true,
				stderr: true,
			},
			phpunit: {
				command: 'npm run test:php',
			},
			verify_matching_versions: {
				command: 'php bin/verify-version-consistency.php',
			},
			transform_readme: {
				command: 'php bin/transform-readme.php',
			},
			create_build_zip: {
				command:
					'if [ ! -e build ]; then echo "Run grunt build first."; exit 1; fi; if [ -e project_urlname.zip ]; then rm project_urlname.zip; fi; cd build; zip -r ../project_urlname.zip .; cd ..; echo; echo "ZIP of build: $(pwd)/project_urlname.zip"',
			},
		},
	});

	// Load tasks.
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-shell');

	// Register tasks.
	grunt.registerTask('default', ['build']);

	grunt.registerTask('build', function () {
		const done = this.async();
		const spawnQueue = [];
		const stdout = [];

		spawnQueue.push(
			{
				cmd: 'git',
				args: [
					'--no-pager',
					'log',
					'-1',
					'--format=%h',
					'--date=short',
				],
			},
			{
				cmd: 'git',
				args: ['ls-files'],
			}
		);

		function finalize() {
			const commitHash = stdout.shift();
			const lsOutput = stdout.shift();
			const versionAppend =
				commitHash +
				'-' +
				new Date()
					.toISOString()
					.replace(/\.\d+/, '')
					.replace(/-|:/g, '');

			const paths = lsOutput
				.trim()
				.split(/\n/)
				.filter(function (file) {
					return !/^(\.|bin|([^/]+)+\.(json|xml)|Gruntfile\.js|tests|README\.md|CONTRIBUTING\.md|\.wordpress-org|composer\..*|webpack.*|phpstan.*)/.test(
						file
					);
				});

			grunt.task.run('shell:transform_readme');
			paths.push('readme.txt');

			grunt.task.run('clean');
			grunt.config.set('copy', {
				build: {
					src: paths,
					dest: 'build',
					expand: true,
					options: {
						noProcess: ['*/**', 'LICENSE'], // We only want to process plugin.php and README.md.
						process(content, srcpath) {
							let matches, version, versionRegex;
							if (/plugin\.php$/.test(srcpath)) {
								versionRegex =
									/(\*\s+Version:\s+)(\d+(\.\d+)+-\w+)/;

								// If not a stable build (e.g. 0.7.0-beta), amend the version with the git commit and current timestamp.
								matches = content.match(versionRegex);
								if (matches) {
									version = matches[2] + '-' + versionAppend;
									console.log(
										'Updating version in plugin.php to ' +
											version
									);
									content = content.replace(
										versionRegex,
										'$1' + version
									);
									content = content.replace(
										/(define\(\s*'project_name_PLUGIN_VERSION',\s*')(.+?)(?=')/,
										'$1' + version
									);
								}
							}
							return content;
						},
					},
				},
			});
			grunt.task.run('copy');

			done();
		}

		function doNext() {
			const nextSpawnArgs = spawnQueue.shift();
			if (!nextSpawnArgs) {
				finalize();
			} else {
				grunt.util.spawn(nextSpawnArgs, function (err, res) {
					if (err) {
						throw new Error(err.message);
					}
					stdout.push(res.stdout);
					doNext();
				});
			}
		}

		doNext();
	});

	grunt.registerTask('create-build-zip', ['shell:create_build_zip']);

	grunt.registerTask('pre_deploy', [
		'shell:verify_matching_versions',
		'shell:phpunit',
		'build',
		// 'wp_deploy',
	]);
};
