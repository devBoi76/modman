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
exports.update_all_if_needed = exports.sync_all_repos = exports.remove_repo = exports.add_repos = exports.sync_packages_one_repo = exports.get_available_packages = exports.download_locator = exports.download_release = void 0;
const util = __importStar(require("./util"));
const fs = __importStar(require("fs"));
const packages = __importStar(require("./package"));
const configuration = __importStar(require("./configuration"));
var FormData = require('form-data');
function download_release(release, mods_folder, known_packages) {
    let parent_pkg = packages.locator_to_package(packages.Locator.from_short_slug(release.parent_locator), known_packages);
    const file = fs.createWriteStream(mods_folder + "/" + parent_pkg.name + "_" + release.game_version + "_v_" + release.version + ".jar");
    if (release.prefer_link) {
        util.print_debug(release.direct_link);
        util.adapter_for(release.direct_link).get(release.direct_link, (response) => {
            response.pipe(file);
        });
    }
    else {
        util.adapter_for(parent_pkg.repository).get(`${parent_pkg.repository}/v1/download_release/${parent_pkg.slug}/${release.id}`, (response) => {
            response.pipe(file);
        });
    }
}
exports.download_release = download_release;
function download_locator(locator, mods_folder, known_packages) {
    let rel = packages.locator_to_release(locator, known_packages);
    download_release(rel, mods_folder, known_packages);
}
exports.download_locator = download_locator;
function get_available_packages(repo, as_json) {
    let resp = util.get_sync(repo + "/v1/get_available_packages");
    if (resp == undefined) {
        util.print_error(`Could not reach repository "${repo}"`);
        util.print_note("Perhaps you made a typo or the repository is currently offline.");
        process.exit();
    }
    if (as_json === true) {
        return JSON.parse(resp);
    }
    return resp;
}
exports.get_available_packages = get_available_packages;
function sync_packages_one_repo(repo) {
    fs.writeFileSync("./.modman/pkg_idx.json", get_available_packages(repo));
}
exports.sync_packages_one_repo = sync_packages_one_repo;
function add_repos(repos) {
    let config = JSON.parse(fs.readFileSync("./.modman/conf.json", { encoding: 'utf8', flag: 'r' }));
    let repo_objs = new Array();
    for (const repo of repos) {
        // let resp = util.get_sync(`${repo}/get_repo_info`);
        // if (resp == undefined) {
        //     util.print_error(`Repository ${repo} could not be reached`);
        //     util.print_note("Perhaps it is offline or you made a typo");
        //     process.exit()
        // }
        // console.log(resp);
        // resp = JSON.parse(resp);
        // console.log(resp);
        // if(![1, 2].includes(resp.api_type)) {
        //     util.print_error(`Unknown repository type ${resp.api_type} for ${repo}`);
        //     process.exit();
        // }
        let new_repo = {
            url: repo,
            api_type: 1
        };
        repo_objs.push(new_repo);
    }
    config.repos = config.repos.concat(repo_objs);
    fs.writeFileSync("./.modman/conf.json", JSON.stringify(config));
    sync_all_repos();
}
exports.add_repos = add_repos;
function remove_repo(repo) {
    let config = JSON.parse(fs.readFileSync("./.modman/conf.json", { encoding: 'utf8', flag: 'r' }));
    let tmp = config.repos.length;
    config.repos = config.repos.filter((repository) => {
        return repository.url != repo;
    });
    if (config.repos.length == tmp) {
        util.print_error("You have not added this repository, so you can't remove it");
        process.exit();
    }
    fs.writeFileSync("./.modman/conf.json", JSON.stringify(config));
}
exports.remove_repo = remove_repo;
function sync_all_repos() {
    configuration.ensure_repos();
    util.print_note("Synchronizing with all known repositories..");
    let config = JSON.parse(fs.readFileSync("./.modman/conf.json", { encoding: 'utf8', flag: 'r' }));
    let indexes_to_sync = [];
    for (const repo of config.repos) {
        if (repo.api_type == 2) {
            util.print_error("TODO: api v2 support");
            process.exit();
        }
        if (repo.api_type == 1) {
            indexes_to_sync.push(get_available_packages(repo.url, true));
        }
    }
    let unified = packages.unify_indexes(indexes_to_sync);
    fs.writeFileSync("./.modman/pkg_idx.json", JSON.stringify(unified));
    util.print_note("Done!");
}
exports.sync_all_repos = sync_all_repos;
function update_all_if_needed(installed, known_packages, fold, game_version) {
    // we sync repos before calling this function, so we have all up to date packages
    let to_update = [];
    for (const locator of installed.locators) {
        let rel = packages.locator_to_release(locator, known_packages);
        let ppkg = packages.locator_to_package(locator, known_packages);
        // get latest release
        let nrel = packages.get_desired_release(ppkg, game_version);
        if (nrel.released > rel.released) {
            to_update.push(nrel);
        }
    }
    util.print_note(`Updating packages..`);
    for (const rel of to_update) {
        let lloc = packages.Locator.from_short_slug(rel.parent_locator);
        installed.locators = installed.locators.filter(loc => !(loc.slug == lloc.slug && loc.repo == lloc.repo)); // remove old release
        let new_locator = new packages.InstalledLocator(lloc.repo, lloc.slug, lloc.rel_id, Date.now());
        installed.locators.push(new_locator);
        download_release(rel, fold, known_packages);
    }
    fs.writeFileSync(fold + "/installed.json", JSON.stringify(installed));
    util.print_note(`${to_update.length} packages updated`);
}
exports.update_all_if_needed = update_all_if_needed;
//# sourceMappingURL=api.js.map