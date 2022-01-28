import * as packages from "./package"
import * as util from "./util"
import * as configuration from "./configuration"

import * as fs from "fs"

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

export function write(file: installed | config, name: "installed"|"config", fold: string) {
    switch(name) {
        case "installed":
            fs.writeFileSync(fold+"/installed.json", JSON.stringify(file))
            break;
        case "config":
            fs.writeFileSync(fold+"/conf.json", JSON.stringify(file))
            break;
    }
} 


export class installed {
    locators: Array<packages.InstalledLocator>
    constructor() {
        this.locators = []
    }
}

export function get_installed(fold: string) {
    let file: string = undefined;
    let json: installed = undefined;
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

export class config {
    game_version: string;
    repos: Array<packages.Repository>;
    search_modrinth: boolean;
    constructor() {
        this.game_version = "1.16.5";
        this.repos = [];
        this.search_modrinth = false;
    }
}