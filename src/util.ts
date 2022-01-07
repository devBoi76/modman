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

export function print_package(pkg: packages.Package) {
	console.log(`[Package] ${pkg.name} - ${pkg.description}`);
	console.log(`| Releases:`);
	for(const release of pkg.releases) {
		console.log(`|> Version ${release.version} for Minecraft ${release.game_version}`);
	}
}

export const possible_options = ["install", "sync", "remove", "search", "list", "help", "add_repo", "remove_repo", "create_package", "create_release", "upload_release"];
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

export function similarity(s1: string, s2: string) {
	let longer = s1;
	let shorter = s2;
	if (s1.length < s2.length) {
		longer = s2;
		shorter = s1;
	}
	let longer_length = longer.length;
	if (longer_length == 0) {
		return 1.0;
	}
	return (longer_length - editDistance(longer, shorter)) / longer_length;
}

function editDistance(s1: string, s2: string) {
s1 = s1.toLowerCase();
s2 = s2.toLowerCase();

var costs = new Array();
for (var i = 0; i <= s1.length; i++) {
	var lastValue = i;
	for (var j = 0; j <= s2.length; j++) {
	if (i == 0)
		costs[j] = j;
	else {
		if (j > 0) {
		var newValue = costs[j - 1];
		if (s1.charAt(i - 1) != s2.charAt(j - 1))
			newValue = Math.min(Math.min(newValue, lastValue),
			costs[j]) + 1;
		costs[j - 1] = lastValue;
		lastValue = newValue;
		}
	}
	}
	if (i > 0)
	costs[s2.length] = lastValue;
}
return costs[s2.length];
}
