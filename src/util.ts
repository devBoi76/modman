let prmpt = require("prompt-sync")({ sigint: true });
import * as packages from "./package"
// var XMLHttpRequest = require("xmlhttprequest");
import * as xmlhpr from "xmlhttprequest"

export function ask_user(text: string, options: Array<string>, default_option: string) {
	const options_str = options.join("/").replace(default_option, default_option.toUpperCase());
	const prompt_str = text + " [" + options_str + "]: ";
	return prmpt(prompt_str, default_option);
}
export function print_error(text: string) {
	console.log(`[ERROR] ${text}`);
}
export function print_note(text: string) {
	console.log(`[NOTE] ${text}`);
}

export function print_release(release: packages.Release, known_packages: JSON): void {
    let a = packages.id_to_object(release.parent_package_id, known_packages);
	if(release.is_dependency){
		console.log(`[Dependency]: ${a.name} version ${release.version} for minecraft ${release.game_version}`)
		return;
	}
	console.log(`[Release]: ${a.name} version ${release.version} for minecraft ${release.game_version}`)
}

export const possible_options = ["install", "sync", "remove", "list", "help", "add_repo", "remove_repo", "create_package", "create_release", "upload_release"];
export const possible_args = {
	VERSION: "--version",
	INSTALL_METHOD: "--method" // packageBehavior
}
export function arr_eq(arrOne: Array<any>, arrTwo: Array<any>): boolean {
	return JSON.stringify(arrOne) == JSON.stringify(arrTwo)
}

export function get_sync(uri: string) {
	var request = new xmlhpr.XMLHttpRequest();
	request.open('GET', uri, false);
	request.send();
	return request.responseText;
}

export function get_help() {
	console.log("[POSSIBLE COMMANDS]:");
	console.log("`modman install <mod names>`");
	console.log("`modman add_repos <urls>` - add a mod repository (or multiple)");
	console.log("`modman remove_repo <url>` - remove a mod repository");
	console.log("`modman sync` - update the mod index with the added repositories");
	console.log("`modman help` - display this message");
	console.log("[POSSIBLE ARGUMENTS]:");
	console.log("`modman install --version <minecraft version>` - download the package for a specified version");
}