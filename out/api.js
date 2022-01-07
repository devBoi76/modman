"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload_release_file = exports.create_release = exports.create_package = exports.sync_all_repos = exports.remove_repo = exports.add_repos = exports.sync_packages_one_repo = exports.get_available_packages = exports.download_release = void 0;
const http = __importStar(require("http"));
const util = __importStar(require("./util"));
const fs = __importStar(require("fs"));
const packages = __importStar(require("./package"));
var FormData = require('form-data');
function download_release(release, known_packages) {
    let parent_pkg = packages.id_to_object(release.parent_package_id, known_packages);
    const file = fs.createWriteStream(parent_pkg.name + "_" + release.game_version + "_v_" + release.version + ".jar");
    http.get(`${parent_pkg.repository}/download_release/${parent_pkg.repository_id}/${release.id}`, (response) => {
        response.pipe(file);
    });
}
exports.download_release = download_release;
function get_available_packages(repo, as_json) {
    if (as_json === true) {
        return JSON.parse(util.get_sync(repo + "/get_available_packages"));
    }
    return util.get_sync(repo + "/get_available_packages");
}
exports.get_available_packages = get_available_packages;
function sync_packages_one_repo(repo) {
    fs.writeFileSync("./.modman/pkg_idx.json", get_available_packages(repo));
}
exports.sync_packages_one_repo = sync_packages_one_repo;
function add_repos(repo) {
    let config = JSON.parse(fs.readFileSync("./.modman/conf.json", { encoding: 'utf8', flag: 'r' }));
    config.repos = config.repos.concat(repo);
    fs.writeFileSync("./.modman/conf.json", JSON.stringify(config));
}
exports.add_repos = add_repos;
function remove_repo(repo) {
    let config = JSON.parse(fs.readFileSync("./.modman/conf.json", { encoding: 'utf8', flag: 'r' }));
    let tmp = config.repos.length;
    config.repos = config.repos.filter((value) => {
        return value != repo;
    });
    if (config.repos.length == tmp) {
        util.print_error("You have not added this repository, so you can't remove it");
        process.exit();
    }
    fs.writeFileSync("./.modman/conf.json", JSON.stringify(config));
}
exports.remove_repo = remove_repo;
function sync_all_repos() {
    util.print_note("Synchronizing with all known repositories..");
    let config = JSON.parse(fs.readFileSync("./.modman/conf.json", { encoding: 'utf8', flag: 'r' }));
    let indexes_to_sync = [];
    for (const repo of config.repos) {
        indexes_to_sync.push(get_available_packages(repo, true));
    }
    let unified = packages.unify_indexes(indexes_to_sync);
    fs.writeFileSync("./.modman/pkg_idx.json", JSON.stringify(unified));
    util.print_note("Done!");
}
exports.sync_all_repos = sync_all_repos;
function create_package(repo, name, description) {
    let form = new FormData();
    form.append("name", name);
    form.append("description", description);
    form.submit(repo + "/create_package", (err, res) => {
        if (err) {
            throw err;
        }
        console.log(res.statusCode);
        res.resume();
    });
}
exports.create_package = create_package;
function create_release(repo, version, game_version, deps, parent_packge_repo_id) {
    let form = new FormData();
    form.append("version", version);
    form.append("game_version", game_version);
    form.append("deps", deps);
    form.append("parent_package_id", parent_packge_repo_id);
    form.submit(repo + "/create_release", (err, res) => {
        if (err) {
            throw err;
        }
        console.log(res.statusCode);
        res.resume();
    });
}
exports.create_release = create_release;
function upload_release_file(repo, file_path, package_repo_id, release_id) {
    let form = new FormData();
    form.append("file", fs.createReadStream(file_path));
    form.submit(`${repo}/upload_release_file/${package_repo_id}/${release_id}`, (err, res) => {
        if (err) {
            throw err;
        }
        console.log(res.statusCode);
        res.resume();
    });
}
exports.upload_release_file = upload_release_file;
//# sourceMappingURL=api.js.map