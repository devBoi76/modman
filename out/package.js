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
exports.add_as_installed = exports.check_if_installed = exports.unify_indexes = exports.release_compatible = exports.get_desired_release = exports.names_to_objects = exports.read_installed_json = exports.get_total_downloads = exports.locator_to_package = exports.locator_to_release = exports.InstalledLocator = exports.Locator = void 0;
const fs = __importStar(require("fs"));
const util = __importStar(require("./util"));
var prompt = require('prompt-sync')();
class Locator {
    constructor(repo, slug, rel_id) {
        this.repo = repo;
        this.slug = slug;
        this.rel_id = rel_id;
    }
    static from_short_slug(sslug) {
        let split = sslug.split("->");
        let rel_id = split.pop();
        let slug = split.pop();
        let repo = split.pop();
        // util.print_debug([sslug, split, rel_id, slug, repo])
        return new this(repo, slug, Number(rel_id));
    }
    get short_slug() {
        return `${this.repo}->${this.slug}->${this.rel_id}`;
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
function locator_to_release(ldata, known_packages) {
    // util.print_debug([locator.repo])
    let locator = new Locator(ldata.repo, ldata.slug, ldata.rel_id);
    known_packages = known_packages.filter((pkg) => { return pkg.repository == locator.repo; });
    if (known_packages.length == 0) {
        util.print_error(`Repository ${locator.repo} not found`);
        process.exit();
    }
    known_packages = known_packages.filter((pkg) => { return pkg.slug == locator.slug; });
    if (known_packages.length == 0) {
        util.print_error(`Package ${locator.repo}->${locator.slug} not found`);
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
function locator_to_package(ldata, known_packages) {
    // util.print_debug([locator.short_slug, locator.repo])
    known_packages = known_packages.filter((pkg) => { return pkg.repository == ldata.repo; });
    if (known_packages.length == 0) {
        util.print_error(`Repository ${ldata.repo} not found`);
        process.exit();
    }
    known_packages = known_packages.filter((pkg) => { return pkg.slug == ldata.slug; });
    if (known_packages.length == 0) {
        util.print_error(`Package ${ldata.repo}->${ldata.slug} not found`);
        process.exit();
    }
    return known_packages[0];
}
exports.locator_to_package = locator_to_package;
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
function read_installed_json(fold) {
    let json = undefined;
    try {
        let file = fs.readFileSync(fold + "/installed.json", "utf8");
        json = JSON.parse(file);
    }
    catch (err) {
        json;
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
    let unified_index = [];
    for (const index of indexes) {
        for (const pkg of index) {
            unified_index.push(pkg);
        }
    }
    return unified_index;
}
exports.unify_indexes = unify_indexes;
function check_if_installed(release, fold, known_packages) {
    let installed = read_installed_json(fold);
    let ppkg = locator_to_package(Locator.from_short_slug(release.parent_locator), known_packages);
    let a = installed.locators.filter(loc => loc.slug == ppkg.slug);
    return a.length > 0;
}
exports.check_if_installed = check_if_installed;
function add_as_installed(release, fold, known_packages) {
    let file = read_installed_json(fold);
    let locator = Locator.from_short_slug(release.parent_locator);
    if (!(file.locators.map(loc => loc.repo + loc.slug).includes(locator.repo + locator.slug))) {
        let installed_locator = new InstalledLocator(locator.repo, locator.slug, locator.rel_id, Date.now());
        file.locators.push(installed_locator);
    }
    else {
        let idx = file.locators.findIndex(loc => loc.repo + loc.slug == locator.repo + locator.slug);
        file.locators[idx].updated = Date.now(); // update last checked
    }
    fs.writeFileSync(fold + "/installed.json", JSON.stringify(file));
}
exports.add_as_installed = add_as_installed;
//# sourceMappingURL=package.js.map