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
exports.get_help = exports.get_sync = exports.arr_eq = exports.possible_args = exports.possible_options = exports.print_release = exports.print_note = exports.print_error = exports.ask_user = void 0;
let prmpt = require("prompt-sync")({ sigint: true });
const packages = __importStar(require("./package"));
// var XMLHttpRequest = require("xmlhttprequest");
const xmlhpr = __importStar(require("xmlhttprequest"));
function ask_user(text, options, default_option) {
    const options_str = options.join("/").replace(default_option, default_option.toUpperCase());
    const prompt_str = text + " [" + options_str + "]: ";
    return prmpt(prompt_str, default_option);
}
exports.ask_user = ask_user;
function print_error(text) {
    console.log(`[ERROR] ${text}`);
}
exports.print_error = print_error;
function print_note(text) {
    console.log(`[NOTE] ${text}`);
}
exports.print_note = print_note;
function print_release(release, known_packages) {
    let a = packages.id_to_object(release.parent_package_id, known_packages);
    if (release.is_dependency) {
        console.log(`[Dependency]: ${a.name} version ${release.version} for minecraft ${release.game_version}`);
        return;
    }
    console.log(`[Release]: ${a.name} version ${release.version} for minecraft ${release.game_version}`);
}
exports.print_release = print_release;
exports.possible_options = ["install", "sync", "remove", "list", "help", "add_repo", "remove_repo", "create_package", "create_release", "upload_release"];
exports.possible_args = {
    VERSION: "--version",
    INSTALL_METHOD: "--method" // packageBehavior
};
function arr_eq(arrOne, arrTwo) {
    return JSON.stringify(arrOne) == JSON.stringify(arrTwo);
}
exports.arr_eq = arr_eq;
function get_sync(uri) {
    var request = new xmlhpr.XMLHttpRequest();
    request.open('GET', uri, false);
    request.send();
    return request.responseText;
}
exports.get_sync = get_sync;
function get_help() {
    console.log("[POSSIBLE COMMANDS]:");
    console.log("`modman install <mod names>`");
    console.log("`modman add_repos <urls>` - add a mod repository (or multiple)");
    console.log("`modman remove_repo <url>` - remove a mod repository");
    console.log("`modman sync` - update the mod index with the added repositories");
    console.log("`modman help` - display this message");
    console.log("[POSSIBLE ARGUMENTS]:");
    console.log("`modman install --version <minecraft version>` - download the package for a specified version");
}
exports.get_help = get_help;
//# sourceMappingURL=util.js.map