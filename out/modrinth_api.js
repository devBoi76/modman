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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.download_release = exports.get_desired_release = exports.print_version = exports.print_package = exports.get_mod_version = exports.get_mod_versions = exports.modrinth_to_internal = exports.search_mods = exports.search_mod = exports.ModirinthPackage = exports.VersionFile = exports.Version = exports.ModResult = void 0;
const packages = __importStar(require("./package"));
const util = __importStar(require("./util"));
const https = __importStar(require("https"));
const fs = __importStar(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const api_url = "https://api.modrinth.com";
class ModResult {
}
exports.ModResult = ModResult;
class Version {
}
exports.Version = Version;
class VersionFile {
}
exports.VersionFile = VersionFile;
class ModirinthPackage extends packages.Package {
    constructor(id, name, description, versions, downloads) {
        super(-1, name, description, [], "modrinth", -1);
        this.modirinth_id = id;
        this.versions = versions;
        this.downloads = downloads;
    }
}
exports.ModirinthPackage = ModirinthPackage;
function search_mod(query, version) {
    let mod_results = util.get_sync(`${api_url}/api/v1/mod?query=${query}&&versions="version=${version}"`);
    mod_results = JSON.parse(mod_results);
    let j_res = mod_results.hits;
    if (j_res.length == 0) {
        util.print_error("Could not find any packages on modrinth");
        process.exit();
    }
    j_res = j_res.filter((mod) => { return util.similarity(mod.title, query) > 0.6; });
    return j_res;
}
exports.search_mod = search_mod;
function search_mods(query, version, give_prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        let promises = new Array();
        for (const q of query) {
            promises.push(node_fetch_1.default(`${api_url}/api/v1/mod?query=${q}&&versions="version=${version}"`));
        }
        let resolved_promises = yield Promise.all(promises);
        let hits = new Array();
        for (let i = 0; i < resolved_promises.length; i++) {
            hits.push(yield resolved_promises[i].json());
        }
        let mods = hits.flatMap((hit) => {
            return hit.hits;
        });
        // let j_res: Array<ModResult> = mod_results.hits;
        if (mods.length == 0) {
            util.print_error("Could not find any packages on modrinth");
            process.exit();
        }
        // TODO: make this better
        mods = mods.filter((mod) => {
            let best_match = util.most_similar(mod.title, query);
            let sim = util.similarity(mod.title, best_match);
            if (sim > 0.9 || !give_prompt && sim > 0.7) {
                return true;
            }
            else if (sim > 0.6 && give_prompt) {
                return util.ask_user(`A similar match to "${best_match}" found, did you mean "${mod.title}" ?`, ['y', 'n'], 'y') == 'y';
            }
            false;
        });
        return mods;
    });
}
exports.search_mods = search_mods;
function modrinth_to_internal(mod_res) {
    let versions = get_mod_versions(mod_res.mod_id.replace("local-", ""));
    return new ModirinthPackage(mod_res.mod_id, mod_res.title, mod_res.description, versions, mod_res.downloads);
}
exports.modrinth_to_internal = modrinth_to_internal;
function get_mod_versions(mod_id) {
    let a = util.get_sync(`${api_url}/api/v1/mod/${mod_id.replace("local-", "")}/version`);
    return JSON.parse(a);
}
exports.get_mod_versions = get_mod_versions;
function get_mod_version(version_id) {
    return util.get_sync(`${api_url}/api/v1/version/{version_id}`);
}
exports.get_mod_version = get_mod_version;
function print_package(pkg) {
    let releases = pkg.versions;
    console.log(`${util.colors.BgYellow}${util.colors.FgBlack}[External Package]${util.colors.Reset} ${pkg.name} - ${pkg.description}`);
    console.log(`| Total Downloads: ${pkg.downloads} | Repository: ${pkg.repository}`);
    console.log(`| Releases:`);
    if (releases.length == 0) {
        console.log("| No releases found\n");
        return;
    }
    let visible = releases.slice(0, 6);
    for (const release of visible) {
        console.log(`|> Version ${release.version_number} for Minecraft ${release.game_versions.join(", ")} (${release.downloads})`);
    }
    if (releases.length - visible.length > 0) {
        console.log(`| And ${releases.length - visible.length} more..`);
    }
    console.log("");
}
exports.print_package = print_package;
function print_version(version) {
    console.log(`${util.colors.BgYellow}${util.colors.FgBlack}[External Release]${util.colors.Reset} ${version.name}`);
}
exports.print_version = print_version;
// NOTE: This function will be slow, the biggest delay is waiting for modrinth. 
// It is only making one request per package which seems reasonable.
function get_desired_release(pkg, game_version) {
    let all_vers = get_mod_versions(pkg.mod_id);
    all_vers = all_vers.filter((version) => {
        for (const gver of version.game_versions) {
            if (packages.release_compatible(gver, game_version)) {
                return true;
            }
        }
        return false;
    });
    return all_vers.sort((ver1, ver2) => { return Date.parse(ver2.date_published) - Date.parse(ver1.date_published); })[0];
}
exports.get_desired_release = get_desired_release;
function download_release(release, mods_folder) {
    const file = fs.createWriteStream(mods_folder + "/" + release.files[0].filename);
    https.get(release.files[0].url, (response) => {
        response.pipe(file);
    });
}
exports.download_release = download_release;
//# sourceMappingURL=modrinth_api.js.map