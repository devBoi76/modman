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
exports.add_as_installed = exports.unify_indexes = exports.release_compatible = exports.get_desired_release = exports.repo_id_to_object = exports.id_to_object = exports.names_to_objects = exports.read_installed_json = exports.read_pkg_json = exports.get_total_downloads = exports.release_to_locator = exports.locator_to_package = exports.locator_to_release = exports.InstalledLocator = exports.Locator = exports.Repository = exports.Package = exports.Dependency = exports.Release = void 0;
const fs = __importStar(require("fs"));
const configuration = __importStar(require("./configuration"));
const util = __importStar(require("./util"));
const filedef = __importStar(require("./filedef"));
var prompt = require('prompt-sync')();
class Release {
}
exports.Release = Release;
class Dependency {
}
exports.Dependency = Dependency;
class Package {
    constructor(id, name, description, releases, repository, repository_id) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.releases = releases;
        this.repository = repository;
        this.repository_id = repository_id;
    }
}
exports.Package = Package;
class Repository {
    constructor(url, api_type) {
        this.url = url;
        this.api_type = api_type;
    }
}
exports.Repository = Repository;
class Locator {
    constructor(repo, slug, rel_id) {
        this.repo = repo;
        this.slug = slug;
        this.rel_id = rel_id;
    }
    get short_slug() {
        return `${this.repo}/${this.slug}/${this.rel_id}`;
    }
}
exports.Locator = Locator;
class InstalledLocator extends Locator {
    constructor(repo, slug, rel_id, updated) {
        super(repo, slug, rel_id);
        this.updated = updated;
    }
}
exports.InstalledLocator = InstalledLocator;
function locator_to_release(locator, known_packages) {
    known_packages = known_packages.filter((pkg) => { return pkg.repository == locator.repo; });
    if (known_packages.length == 0) {
        util.print_error(`Repository ${locator.repo} not found`);
        process.exit();
    }
    known_packages = known_packages.filter((pkg) => { return pkg.slug == locator.slug; });
    if (known_packages.length == 0) {
        util.print_error(`Package ${locator.repo}/${locator.slug} not found`);
        process.exit();
    }
    let rel = undefined;
    try {
        rel = known_packages[0].releases[locator.rel_id];
    }
    catch (err) {
        util.print_error(`Release ${locator.short_slug} not found`);
        process.exit();
    }
    return rel;
}
exports.locator_to_release = locator_to_release;
function locator_to_package(locator, known_packages) {
    known_packages = known_packages.filter((pkg) => { return pkg.repository == locator.repo; });
    if (known_packages.length == 0) {
        util.print_error(`Repository ${locator.repo} not found`);
        process.exit();
    }
    known_packages = known_packages.filter((pkg) => { return pkg.slug == locator.slug; });
    if (known_packages.length == 0) {
        util.print_error(`Package ${locator.repo}/${locator.slug} not found`);
        process.exit();
    }
    return known_packages[0];
}
exports.locator_to_package = locator_to_package;
function release_to_locator(release, known_packages) {
    let ppkg = id_to_object(release.parent_package_id, known_packages);
    return new Locator(ppkg.repository, ppkg.slug, release.id);
}
exports.release_to_locator = release_to_locator;
// When we parse the package JSON to an object, the object doesn't have any function as JSON doesn't store them, so we have to do this
function get_total_downloads(pkg) {
    let all = 0;
    if (pkg.releases.length == 0) {
        return all;
    }
    for (const rel of pkg.releases) {
        all += rel.downloads;
    }
    return all;
}
exports.get_total_downloads = get_total_downloads;
function read_pkg_json(conf_fold) {
    let file = undefined;
    let json = undefined;
    configuration.ensure_repos();
    try {
        file = fs.readFileSync(conf_fold + "/pkg_idx.json", "utf8");
        json = JSON.parse(file);
    }
    catch (err) {
        util.print_error("Could not read " + conf_fold + "/pkg_idx.json");
        util.print_note("Perhaps you haven't added any repositories. Consider adding one with `modman add_repo <repository url>`");
        process.exit();
    }
    if (json.length == 0) {
        util.print_error("No known packages found");
    }
    return json;
}
exports.read_pkg_json = read_pkg_json;
function read_installed_json(fold) {
    let json = undefined;
    try {
        let file = fs.readFileSync(fold + "/installed.json", "utf8");
        json = JSON.parse(file);
    }
    catch (err) {
        json = new filedef.installed();
    }
    return json;
}
exports.read_installed_json = read_installed_json;
function names_to_objects(package_names, known_packages, exit) {
    // also filters for slugs
    let objects = new Set();
    for (const name of package_names) {
        let pkgs = known_packages.filter(pkg => pkg.name.toLowerCase() == name.toLowerCase() || pkg.slug == name.toLowerCase());
        if (pkgs.length > 1) {
            util.print_note(`${pkgs.length} packages with the name ${name} found`);
            for (let i = 0; i < pkgs.length; i++) {
                console.log(i + 1);
                util.print_package(pkgs[i]);
            }
            let selection = prompt(`Which package to install? [${util.range(1, pkgs.length, 1).join(", ")}]: `, 1);
            objects.add(pkgs[parseInt(selection) - 1]);
        }
        else if (pkgs.length == 1) { // 1 package found
            objects.add(pkgs[0]);
        }
        else {
            util.print_error(`Package "${name}" not found in the native repositories`);
            let best_match = "";
            let k_names = known_packages.map((value) => { return value.name.toLowerCase(); });
            for (const name_b of k_names) {
                if (util.similarity(name.toLowerCase(), name_b) > util.similarity(best_match, name_b)) {
                    best_match = name_b;
                }
            }
            if (util.similarity(name, best_match) > 0.6) {
                util.print_note(`Did you mean "${best_match}"?`);
            }
            if (exit) {
                process.exit();
            }
        }
    }
    return objects;
}
exports.names_to_objects = names_to_objects;
function id_to_object(id, known_packages) {
    return known_packages.filter(pkg => pkg.id === id)[0];
}
exports.id_to_object = id_to_object;
function repo_id_to_object(known_packages, repo_id, repo) {
    known_packages = known_packages.filter((pkg) => {
        pkg.repository_id == repo_id;
    });
    if (repo) {
        known_packages = known_packages.filter((pkg) => {
            pkg.repository == repo;
        });
    }
    return known_packages[0];
}
exports.repo_id_to_object = repo_id_to_object;
function get_desired_release(pkg, game_version, release_version) {
    // NOTE: Uses `latest` unless a version is specified
    let options = pkg.releases.filter((value) => {
        return release_compatible(value.game_version, game_version);
    });
    if (release_version) {
        options = options.filter((value) => {
            return value.version == release_version;
        });
    }
    let newest = options.sort((a, b) => {
        return b.released - a.released;
    });
    if (newest.length === 0) {
        util.print_error(`ERROR - package ${pkg.name} for version ${game_version} not found`);
        process.exit();
    }
    return newest[0];
}
exports.get_desired_release = get_desired_release;
function release_compatible(release1, release2) {
    let arr1 = release1.split(".");
    let arr2 = release2.split(".");
    return (release1 == release2 || util.arr_eq(arr1.slice(0, 2), arr2.slice(0, 2)));
}
exports.release_compatible = release_compatible;
function unify_indexes(indexes) {
    let id_counter = 0;
    let unified_index = [];
    for (const index of indexes) {
        for (const pkg of index) {
            pkg.id = id_counter;
            for (let i = 0; i < pkg.releases.length; i++) {
                pkg.releases[i].parent_package_id = id_counter;
            }
            unified_index.push(pkg);
            id_counter += 1;
        }
    }
    return unified_index;
}
exports.unify_indexes = unify_indexes;
function add_as_installed(release, fold, known_packages) {
    let file = read_installed_json(fold);
    let locator = release_to_locator(release, known_packages);
    if (!(file.locators.map(loc => loc.short_slug).includes(locator.short_slug))) {
        let installed_locator = new InstalledLocator(locator.repo, locator.slug, locator.rel_id, Date.now());
        file.locators.push(installed_locator);
    }
    else {
        let idx = file.locators.findIndex(loc => loc.short_slug == locator.short_slug);
        file.locators[idx].updated = Date.now(); // update last checked
    }
    fs.writeFileSync(fold + "/installed.json", JSON.stringify(file));
}
exports.add_as_installed = add_as_installed;
//# sourceMappingURL=package.js.map