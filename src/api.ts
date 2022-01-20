import * as util from "./util"
import * as fs from "fs"
import * as packages from "./package"
import * as configuration from "./configuration"

var FormData = require('form-data');


export function download_release(release: packages.Release, mods_folder: string, known_packages) {
    let parent_pkg = packages.id_to_object(release.parent_package_id, known_packages);
    const file = fs.createWriteStream(mods_folder+"/" + parent_pkg.name + "_" + release.game_version + "_v_" + release.version + ".jar")
    if(release.prefer_link) {
        util.adapter_for(release.direct_link).get(release.direct_link, (response) => {
            response.pipe(file);
        })
    } else {
        util.adapter_for(parent_pkg.repository).get(`${parent_pkg.repository}/v1/download_release/${parent_pkg.repository_id}/${release.id}`, (response) => {
            response.pipe(file);
        });
    }
}

export function get_available_packages(repo: string, as_json?: boolean) {
    let resp = util.get_sync(repo + "/v1/get_available_packages");
    if (resp == undefined) {
        util.print_error(`Could not reach repository "${repo}"`);
        util.print_note("Perhaps you made a typo or the repository is currently offline.");
        process.exit();
    }

    if(as_json === true) {
        return JSON.parse(resp);
    }
    return resp;
}

export function sync_packages_one_repo(repo: string) {
    fs.writeFileSync("./.modman/pkg_idx.json", get_available_packages(repo));
}

export function add_repos(repos: Array<string>) {
    let config = JSON.parse(fs.readFileSync("./.modman/conf.json", {encoding:'utf8', flag:'r'}))
    let repo_objs = new Array<packages.Repository>()
    for(const repo of repos) {
        let resp = util.get_sync(`${repo}/get_repo_info`);
        if (resp == undefined) {
            util.print_error(`Repository ${repo} could not be reached`);
            util.print_note("Perhaps it is offline or you made a typo");
            process.exit()
        }
        console.log(resp);
        resp = JSON.parse(resp);
        console.log(resp);
        if(![1, 2].includes(resp.api_type)) {
            util.print_error(`Unknown repository type ${resp.api_type} for ${repo}`);
            process.exit();
        }
        repo_objs.push(new packages.Repository(repo, resp.api_type));
    }
    config.repos = config.repos.concat(repo_objs);
    fs.writeFileSync("./.modman/conf.json", JSON.stringify(config));
    sync_all_repos()
}

export function remove_repo(repo: string) {
    let config = JSON.parse(fs.readFileSync("./.modman/conf.json", {encoding:'utf8', flag:'r'}))
    let tmp = config.repos.length;
    config.repos = config.repos.filter( (repository: packages.Repository) => {
        return repository.url != repo;
    });
    if (config.repos.length == tmp) {
        util.print_error("You have not added this repository, so you can't remove it");
        process.exit();
    }
    fs.writeFileSync("./.modman/conf.json", JSON.stringify(config));
}

export function sync_all_repos() {
    configuration.ensure_repos();
    util.print_note("Synchronizing with all known repositories..");
    let config = JSON.parse(fs.readFileSync("./.modman/conf.json", {encoding:'utf8', flag:'r'}));
    let indexes_to_sync: Array<Array<packages.Package>> = [];
    for(const repo of config.repos) {
        if(repo.api_type == 2){
            util.print_error("TODO: api v2 support");
            process.exit();
        }
        if(repo.api_type == 1) {
            indexes_to_sync.push(get_available_packages(repo.url, true));
        }
    }
    let unified = packages.unify_indexes(indexes_to_sync);
    fs.writeFileSync("./.modman/pkg_idx.json", JSON.stringify(unified));
    util.print_note("Done!")
}


// below is unused/useless

export function create_package(repo: string, name: string, description: string) {
    let form = new FormData();
    form.append("name", name);
    form.append("description", description);
    
    form.submit(repo + "/v1/create_package", (err, res) => {
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
    
    form.submit(repo + "/v1/create_release", (err, res) => {
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

    form.submit(`${repo}/v1/upload_release_file/${package_repo_id}/${release_id}`, (err, res) => {
        if(err) {
            throw err;
        }
        console.log(res.statusCode);
        res.resume();
    });
}