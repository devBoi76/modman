import * as http from "http"
import * as util from "./util"
import * as fs from "fs"
import * as packages from "./package"

var FormData = require('form-data');


export function download_release(release: packages.Release, known_packages) {
    let parent_pkg = packages.id_to_object(release.parent_package_id, known_packages);
    const file = fs.createWriteStream(parent_pkg.name + "_" + release.game_version + "_v_" + release.version + ".jar")
    http.get(`${parent_pkg.repository}/download_release/${parent_pkg.repository_id}/${release.id}`, (response) => {
        response.pipe(file);
    });
}

export function get_available_packages(repo: string, as_json?: boolean) {
    if(as_json === true) {
        return JSON.parse(util.get_sync(repo + "/get_available_packages"))
    }
    return util.get_sync(repo + "/get_available_packages")
}

export function sync_packages_one_repo(repo: string) {
    fs.writeFileSync("./.modman/pkg_idx.json", get_available_packages(repo));
}

export function add_repos(repo: Array<string>) {
    let config = JSON.parse(fs.readFileSync("./.modman/conf.json", {encoding:'utf8', flag:'r'}))
    config.repos = config.repos.concat(repo)
    fs.writeFileSync("./.modman/conf.json", JSON.stringify(config));
}

export function remove_repo(repo: string) {
    let config = JSON.parse(fs.readFileSync("./.modman/conf.json", {encoding:'utf8', flag:'r'}))
    let tmp = config.repos.length;
    config.repos = config.repos.filter( (value) => {
        return value != repo;
    });
    if (config.repos.length == tmp) {
        util.print_error("You have not added this repository, so you can't remove it");
        process.exit();
    }
    fs.writeFileSync("./.modman/conf.json", JSON.stringify(config));
}

export function sync_all_repos() {
    util.print_note("Synchronizing with all known repositories..");
    let config = JSON.parse(fs.readFileSync("./.modman/conf.json", {encoding:'utf8', flag:'r'}));
    let indexes_to_sync: Array<Array<packages.Package>> = [];
    for(const repo of config.repos) {
        indexes_to_sync.push(get_available_packages(repo, true));
    }
    let unified = packages.unify_indexes(indexes_to_sync);
    fs.writeFileSync("./.modman/pkg_idx.json", JSON.stringify(unified));
    util.print_note("Done!")
}

export function create_package(repo: string, name: string, description: string) {
    let form = new FormData();
    form.append("name", name);
    form.append("description", description);
    
    form.submit(repo + "/create_package", (err, res) => {
        if(err) {
            throw err;
        }
        console.log(res.statusCode);
        res.resume();
    });
}

export function create_release(repo: string, version: string, game_version: string, deps: string, parent_packge_repo_id: number) {
    let form = new FormData();
    form.append("version", version);
    form.append("game_version", game_version);
    form.append("deps", deps);
    form.append("parent_package_id", parent_packge_repo_id);
    
    form.submit(repo + "/create_release", (err, res) => {
        if(err) {
            throw err;
        }
        console.log(res.statusCode);
        res.resume();
    });
}

export function upload_release_file(repo: string,  file_path: string, package_repo_id: number, release_id: number) { 
    let form = new FormData();
    form.append("file", fs.createReadStream(file_path))

    form.submit(`${repo}/upload_release_file/${package_repo_id}/${release_id}`, (err, res) => {
        if(err) {
            throw err;
        }
        console.log(res.statusCode);
        res.resume();
    });
}