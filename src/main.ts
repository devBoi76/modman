#!/usr/bin/env node

import * as util from "./util";
import * as packages from "./package";
import * as configuration from "./configuration";
import * as context from "./context"
import * as api from "./api";
import * as modrinth from "./modrinth_api";
import * as fs from "fs";

// get config

//ensure that a file at ./modman/conf.js is accesible
configuration.ensure_file();
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
parsed_args.mods_folder = context.point_to_mods_folder()
parsed_args.config_folder = context.point_to_modman_folder()
let config = JSON.parse(fs.readFileSync(parsed_args.config_folder+"/conf.json", "utf8"));

async function main(){
	switch(parsed_args.operation){
		case "install": {
			if(parsed_args.words.length == 0) {
				util.print_error("No packages to install");
				util.print_note("example usage is `./main.js install JEI`");
				process.exit();
			}
			let known_packages = packages.read_pkg_json(parsed_args.config_folder);
			let desired_pkg_names = parsed_args.words;
			let desired_pkg_objects: Set<packages.Package> = packages.names_to_objects(desired_pkg_names, known_packages, !config.search_modrinth); // Set
			
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
					desired_releases.add(r);
				}
			}
			if(desired_releases.size > 0) {
				util.print_note("Packages to install:");
			}
			desired_releases.forEach( (value) => {
				packages.add_as_installed(value, parsed_args.config_folder, known_packages);
				util.print_release(value, known_packages);
				api.download_release(value, parsed_args.mods_folder, known_packages);
			});
			
			// BEGIN MODRINTH
			if(config.search_modrinth && desired_pkg_objects.size != parsed_args.words.length) {
				
				let not_found_pkg_names = new Array<string>();
				let found_pkg_names  = new Array<string>();
				
				for(const pkg of desired_pkg_objects) {
					found_pkg_names.push(pkg.name.toLowerCase());	
				}
				
				for(const word of parsed_args.words) {
					if(!found_pkg_names.includes(word.toLowerCase())) {
						not_found_pkg_names.push(word);
					}
				}

				util.print_note(`Searching through modrinth for ${not_found_pkg_names.join(", ")}..`);

				let modrinth_pkg_objects = await modrinth.search_mods(not_found_pkg_names, parsed_args.version, true);
				let modrinth_releases = new Array<modrinth.Version>();

				for(const pkg of modrinth_pkg_objects) {
					modrinth_releases.push(modrinth.get_desired_release(pkg, parsed_args.version));
				}
				util.print_note("From Modrinth:")
				for(const rel of modrinth_releases) {
					modrinth.print_version(rel);
					modrinth.download_release(rel, parsed_args.mods_folder);
				}
	
			}
			// END MODRINTH

			break;
		}
		case "sync": {
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
				util.print_error("No packagse to search for");
				util.print_note("example usage is `./main.js search JEI`");
				process.exit();
			}
		let known_packages = packages.read_pkg_json(parsed_args.config_folder);
		let desired_pkg_names = parsed_args.words;
		let desired_pkg_objects: Set<packages.Package> = packages.names_to_objects(desired_pkg_names, known_packages, !config.search_modrinth);
		for (const pkg of desired_pkg_objects) {
			util.print_package(pkg);
		}
		if(config.search_modrinth && parsed_args.words.length != desired_pkg_objects.size) {

			let not_found_pkg_names = new Array<string>();
			let     found_pkg_names = new Array<string>();
				
			for(const pkg of desired_pkg_objects) {
				found_pkg_names.push(pkg.name.toLowerCase());	
			}
			
			for(const word of parsed_args.words) {
				if(!found_pkg_names.includes(word.toLowerCase())) {
					not_found_pkg_names.push(word);
				}
			}

			let modrinth_pkg_objects = await modrinth.search_mods(not_found_pkg_names, parsed_args.version, true);
			
			// for(const name of not_found_pkg_names) {
			// 	modrinth_pkg_objects = modrinth_pkg_objects.concat(modrinth.search_mod(name, parsed_args.version));
			// }
			util.print_note(`Searching through modrinth for ${not_found_pkg_names.join(", ")}..`);
			console.log(modrinth_pkg_objects)
			for(const pkg of modrinth_pkg_objects) {
				modrinth.print_package(modrinth.modrinth_to_internal(pkg));
			}
			util.print_note(`Searching through modrinth returned ${modrinth_pkg_objects.length} more packages`);

		}
		break;
		}
		case "list": {
			let known_packages = packages.read_pkg_json(parsed_args.config_folder);
			let installed = packages.read_installed_json(parsed_args.config_folder)
			util.print_note("Installed Mods:")
			for(const loc of installed.locators) {
				let rel = packages.locator_to_release(loc, known_packages)
				util.print_release(rel, known_packages);
			}
			break;
		}
		case "update": {
			let known_packages = packages.read_pkg_json(parsed_args.config_folder);
			let installed = packages.read_installed_json(parsed_args.config_folder);
			api.sync_all_repos()
			api.update_all_if_needed(installed, known_packages, parsed_args.config_folder, parsed_args.version)
		}
	}
	
}

main();
