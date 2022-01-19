import * as util from './util'
import * as fs from 'fs'

export function point_to_mods_folder(): string {
    let cwd = process.cwd().split("/")

    if(cwd[cwd.length - 1] == ".minecraft" || cwd[cwd.length - 1] == "minecraft") { // inside .minecraft, point to .minecraft/mods
        cwd.push("mods")
        util.print_debug(`cwd is ${cwd.join("/")}`)
        return cwd.join("/")
    } else {
        util.print_debug(`cwd is ${cwd.join("/")}`)
        return cwd.join("/")
    }
}

export function point_to_modman_folder(): string {
    let cwd = process.cwd()

    let to_check = ["./.modman", "../.modman"] // ordered in priority, eg. if the directory abobve has .modman, but the current one also does, pick the current one
    let path = "" // return "" if its not found
    for(const fpath of to_check) {
        try {
            let _ = fs.accessSync(fpath)
            path = cwd+"/" +fpath
        } catch (err) {}
    }
    return path
}