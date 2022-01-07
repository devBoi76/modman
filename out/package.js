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
exports.unify_indexes = exports.release_compatible = exports.get_desired_release = exports.id_to_object = exports.names_to_objects = exports.read_pkg_json = exports.Package = exports.Dependency = exports.Release = void 0;
const fs = __importStar(require("fs"));
const configuration = __importStar(require("./configuration"));
const util = __importStar(require("./util"));
class Release {
}
exports.Release = Release;
class Dependency {
}
exports.Dependency = Dependency;
class Package {
}
exports.Package = Package;
function read_pkg_json() {
    let file = undefined;
    let json = undefined;
    configuration.ensure_repos();
    try {
        file = fs.readFileSync("./.modman/pkg_idx.json", "utf8");
        json = JSON.parse(file);
    }
    catch (err) {
        util.print_error("Could not read ./.modman/pkg_idx.json");
        util.print_note("Perhaps you haven't added any repositories. Consider adding one with `modman add_repo <repository url>`");
        process.exit();
    }
    if (json.length == 0) {
        util.print_error("No known packages found");
    }
    return json;
}
exports.read_pkg_json = read_pkg_json;
function names_to_objects(package_names, known_packages) {
    let objects = new Set(); // we can use Array.filter() ! IDK about the performance though
    for (const name of package_names) {
        let pkg = known_packages.filter(pkg => pkg.name.toLowerCase() == name.toLowerCase())[0];
        if (pkg) {
            objects.add(pkg);
        }
        else {
            util.print_error(`Package "${name}" not found`);
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
            process.exit();
        }
    }
    return objects;
}
exports.names_to_objects = names_to_objects;
function id_to_object(id, known_packages) {
    return known_packages.filter(pkg => pkg.id === id)[0];
}
exports.id_to_object = id_to_object;
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
    let total_ids = 0;
    let unified_index = [];
    for (const index of indexes) {
        for (const pkg of index) {
            pkg.id = id_counter;
            unified_index.push(pkg);
            id_counter += 1;
        }
    }
    return unified_index;
}
exports.unify_indexes = unify_indexes;
//# sourceMappingURL=package.js.map