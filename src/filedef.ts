import * as packages from "./package"
import * as util from "./util"
import * as configuration from "./configuration"
import * as interfaces from "./interfaces"

import * as fs from "fs"


// This file is meant to define the layout of files that modman interfaces with and provide helper functions to interface with them
// It also contains some classes like `filedef.Package`. The main difference is that `filedef.Package` only contains the stored json fields, while `packages.Package` is a propper class with its own functions

export function get_index(conf_fold: string): Array<interfaces.PackageData> {

    let file: string = undefined;
    let json: Array<interfaces.PackageData> = undefined;
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

export function write(file: interfaces.Installed | interfaces.Config, name: "installed"|"config", fold: string) {
    switch(name) {
        case "installed":
            fs.writeFileSync(fold+"/installed.json", JSON.stringify(file))
            break;
        case "config":
            fs.writeFileSync(fold+"/conf.json", JSON.stringify(file))
            break;
    }
} 

export const default_installed: interfaces.Installed = {
    locators: []
}


export function get_installed(fold: string): interfaces.Installed {
    let file: string = undefined;
    let json: interfaces.Installed = undefined;
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

export const default_config: interfaces.Config = {    
    game_version: "1.16.5",
    repos: [],
    search_modrinth: false 
}

export function get_config(fold: string): interfaces.Config {
    let file: string = undefined;
    let json: interfaces.Config = undefined;
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