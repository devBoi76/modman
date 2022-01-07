#!/usr/bin/env node

import * as util from "./util";
import * as packages from "./package";
import * as configuration from "./configuration";
import * as api from "./api";

async function main(){
	//ensure that a file at ./modman/conf.js is accesible
	configuration.ensure_file();
	
	// parse arguments
	const args = process.argv;
	const options = args.slice(2);
	
	if(options.length == 0){
		util.print_error("No options provided")
		util.print_note(`Possible options: ${util.possible_options.join(", ")}`)
		process.exit();
	}
	if(!util.possible_options.includes(options[0])){
		util.print_error(`Unknown option: \`${options[0]}\``);
		util.print_note(`Possible options: ${util.possible_options.join(", ")}`)
		process.exit();
	}
	// make configuration
	let parsed_args = configuration.parse_args(options); // removes options
	// let config = new configuration.Configuration(parsed_args.version, parsed_args.install_method);
	// console.log(parsed_args);
	// console.log(config);

	switch(parsed_args.operation){
		case "install": {
			console.log("install")
			if(parsed_args.words.length == 0) {
				util.print_error("No packages to install");
				util.print_note("example usage is `./main.js install JEI`");
				process.exit();
			}
			let known_packages = packages.read_pkg_json();
			let desired_pkg_names = parsed_args.words;
			let desired_pkg_objects: Set<packages.Package> = packages.names_to_objects(desired_pkg_names, known_packages); // Set
			
			let desired_releases: Set<packages.Release> = new Set<packages.Release>();

			for(const entry of desired_pkg_objects.entries()) {
				let r = packages.get_desired_release(entry[0], parsed_args.version)
				r.is_dependency = false;
				desired_releases.add(r);
			}
			// resolve dependencies
			for(const rel of desired_releases) {
				for(const dep of rel.deps){
					let p = packages.id_to_object(dep.pkg_id, known_packages)
					let r = p.releases.filter( (value) => value.id == dep.release_id)[0];
					r.is_dependency = true
					desired_releases.add(
						r
						);
				}
			}
			util.print_note("Packages to install:");
			desired_releases.forEach( (value) => {
				util.print_release(value, known_packages);
				api.download_release(value, known_packages);
			});
			break;
		}
		case "sync": {
			console.log("sync");
			api.sync_all_repos();
			break;
		}
		case "add_repo": {
			if(parsed_args.words.length == 0) {
				util.print_error("No repositories to add specified");
				process.exit();
			}
			api.add_repos(parsed_args.words);
			break;
		}
		case "remove_repo": {
			if(parsed_args.words.length != 1) {
				util.print_error("Please specify exactly one repository to remove");
				process.exit();
			}
			api.remove_repo(parsed_args.words[0])
			break;
		}
		case "create_package": {
			if(parsed_args.words.length != 3) {
				util.print_error("Please provide a name and description for the package in the following format:");
				util.print_error("`create_package <repository_url> <name> <description>`")
				process.exit();
			}
			api.create_package(parsed_args.words[0], parsed_args.words[1], parsed_args.words[2]);
			break;
		}
		case "create_release": {
			if(parsed_args.words.length != 5) {
				util.print_error("Please provide a name and description for the release in the following format:");
				util.print_error("`create_package <repository_url> <release_version> <game_version> <dependencies> <repository_package_id>`")
				process.exit();
			}
			api.create_release(parsed_args.words[0], parsed_args.words[1], parsed_args.words[2], parsed_args.words[3], parsed_args.words[4]);
			break;
		}
		case "upload_release": {
			if(parsed_args.words.length != 4) {
				util.print_error("Please provide a name and description for the release file in the following format:");
				util.print_error("`create_package <repository_url> <file_path> <repository_package_id> <release_id>`")
				process.exit();
			}
			api.upload_release_file(parsed_args.words[0], parsed_args.words[1], parsed_args.words[2], parsed_args.words[3]);
			break;
		}
		case "help": {
			util.get_help()
			break;
		}
		case "search": {
			if(parsed_args.words.length == 0) {
				util.print_error("No packages to search for");
				util.print_note("example usage is `./main.js search JEI`");
				process.exit();
			}
		let known_packages = packages.read_pkg_json();
		let desired_pkg_names = parsed_args.words;
		let desired_pkg_objects: Set<packages.Package> = packages.names_to_objects(desired_pkg_names, known_packages);
		for (const pkg of desired_pkg_objects) {
			util.print_package(pkg);
		}
		}
	}
	
}

main();
