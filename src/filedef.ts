import * as packages from "./package"
import * as util from "./util"
import * as configuration from "./configuration"

import * as fs from "fs"


// This file is meant to define the layout of files that modman interfaces with and provide helper functions to interface with them


export function get_index(conf_fold: string): Array<packages.Package> {

    let file: string = undefined;
    let json: Array<packages.Package> = undefined;
    configuration.ensure_repos();
    try {
        file = fs.readFileSync(conf_fold+"/pkg_idx.json", "utf8");
        json = JSON.parse(file);
    } catch (err) {
        util.print_error("Could not read "+ conf_fold+"/pkg_idx.json");
        util.print_note("Perhaps you haven't added any repositories. Consider adding one with `modman add_repo <repository url>`");
        process.exit(1);
    }
    if (json.length == 0) {
        util.print_error("No known packages found")
    }
    return json;
}

export function write(file: Installed | Config, name: "installed"|"config", fold: string) {
    switch(name) {
        case "installed":
            fs.writeFileSync(fold+"/installed.json", JSON.stringify(file))
            break;
        case "config":
            fs.writeFileSync(fold+"/conf.json", JSON.stringify(file))
            break;
    }
} 


export class Installed {
    locators: Array<packages.InstalledLocator>
    constructor() {
        this.locators = []
    }
}

export function get_installed(fold: string) {
    let file: string = undefined;
    let json: Installed = undefined;
    try {
        file = fs.readFileSync(fold+"/installed.json", "utf-8");
        json = JSON.parse(file);
    } catch (err) {
        util.print_error("Could not read " + fold+"/installed.json");
        console.error(err);
        process.exit(1);
    }
    return json;
}

export class Config {
    game_version: string;
    repos: Array<packages.Repository>;
    search_modrinth: boolean;
    constructor() {
        this.game_version = "1.16.5";
        this.repos = [];
        this.search_modrinth = false;
    }
}

export function get_config(fold: string): Config {
    let file: string = undefined;
    let json: Config = undefined;
    try {
        file = fs.readFileSync(fold+"/conf.json", "utf-8");
        json = JSON.parse(file);
    } catch (err) {
        util.print_error("Could not read " + fold+"/conf.json");
        console.error(err);
        process.exit(1);
    }
    return json;
}