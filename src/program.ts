const util = require("./util");
import * as fs from "fs"
import * as api from "./api";

function create_template_file() {
	// const writer = fs.createWriteStream("./.modman/conf.json", {flags: "w"});
	const default_json = {
		version: 0.1,
		fpath: fs.realpath("./.modman/conf.json", ()=>{}),
		repos: []
	};
	fs.writeFileSync("./.modman/conf.json", JSON.stringify(default_json));
};

function create_template_idx_file() {
	// const writer = fs.createWriteStream("./.modman/pkg_idx.json", {flags: "w"});
	// writer.write(api.get_available_packages("http://localhost:5000"));
	fs.writeFileSync("./.modman/pkg_idx.json", api.get_available_packages("http://localhost:5000"))
};

export function install(packages: Array<any>) {
	util.print_error("Not implemented");
}

export function resolve_deps(packages: Array<any>) {
	let all_pkgs: Set<any> = new Set();
	util.print_error("Not implemented");
	for(const pkg of packages) {
		all_pkgs.add(pkg);
	}
	return all_pkgs;
}

export function ensure_file() {
	try {
		try {
			fs.accessSync("./.modman/conf.json");
		} catch (err) {
			// console.error(err);
			create_template_file();
		}

		try {
			fs.accessSync("./.modman/pkg_idx.json");
		} catch (err) {
			// console.error(err);
			create_template_idx_file();
		}
	} catch(err) {
		console.error(err);
	}
}