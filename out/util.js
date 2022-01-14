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
exports.similarity = exports.most_similar = exports.get_help = exports.get_sync = exports.arr_eq = exports.range = exports.print_package = exports.print_release = exports.print_debug = exports.print_note = exports.print_error = exports.ask_user = exports.colors = exports.possible_args = exports.possible_options = void 0;
let prmpt = require("prompt-sync")({ sigint: true });
const packages = __importStar(require("./package"));
// var XMLHttpRequest = require("xmlhttprequest");
const xmlhpr = __importStar(require("xmlhttprequest"));
exports.possible_options = ["install", "sync", "search", "list", "help", "add_repo", "remove_repo", "create_package", "create_release", "upload_release"];
exports.possible_args = {
    VERSION: "--version",
    INSTALL_METHOD: "--method" // packageBehavior
};
exports.colors = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgRedBright: "\x1b[91m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",
    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgRedBright: "\x1b[101m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgYellowBright: "\x1b[103m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m"
};
function ask_user(text, options, default_option) {
    const options_str = options.join("/").replace(default_option, default_option.toUpperCase());
    const prompt_str = exports.colors.Bright + text + " [" + options_str + "]: " + exports.colors.Reset;
    return prmpt(prompt_str, default_option);
}
exports.ask_user = ask_user;
function print_error(text) {
    console.log(`${exports.colors.BgRedBright}${exports.colors.FgBlack}[ERROR]${exports.colors.Reset}${exports.colors.Bright} ${text}${exports.colors.Reset}`);
}
exports.print_error = print_error;
function print_note(text) {
    console.log(`${exports.colors.BgCyan}${exports.colors.FgBlack}[NOTE]${exports.colors.Reset} ${text}`);
}
exports.print_note = print_note;
function print_debug(text) {
    console.log(`${exports.colors.BgYellowBright + exports.colors.FgBlack}[DEBUG]${exports.colors.Reset + exports.colors.Dim} ${text + exports.colors.Reset}`);
}
exports.print_debug = print_debug;
function print_release(release, known_packages) {
    let a = packages.id_to_object(release.parent_package_id, known_packages);
    if (release.is_dependency) {
        console.log(`[Dependency]: ${a.name} version ${release.version} for Minecraft ${release.game_version}`);
        return;
    }
    console.log(`${exports.colors.BgGreen}${exports.colors.FgBlack}[Release]${exports.colors.Reset} ${a.name} version ${release.version} for minecraft ${release.game_version}`);
}
exports.print_release = print_release;
function print_package(pkg) {
    console.log(`${exports.colors.BgGreen}${exports.colors.FgBlack}[Package]${exports.colors.Reset} ${pkg.name} - ${pkg.description}`);
    console.log(`| Total Downloads: ${packages.get_total_downloads(pkg)} | Repository: ${pkg.repository}`);
    console.log(`| Releases:`);
    if (pkg.releases.length == 0) {
        console.log("| No releases found\n");
        return;
    }
    let visible = pkg.releases.slice(0, 6);
    for (const release of visible) {
        console.log(`|> Version ${release.version} for Minecraft ${release.game_version} (${release.downloads})`);
    }
    if (pkg.releases.length - visible.length > 0) {
        console.log(`| And ${pkg.releases.length - visible.length} more..`);
    }
    console.log("");
}
exports.print_package = print_package;
const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));
exports.range = range;
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
    console.log("`modman search <mod name>` - search for a mod from known packages");
    console.log("`modman list` - list all known packages");
    console.log("`modman add_repos <urls>` - add a mod repository (or multiple)");
    console.log("`modman remove_repo <url>` - remove a mod repository");
    console.log("`modman sync` - update the mod index with the added repositories");
    console.log("`modman help` - display this message\n");
    console.log("[POSSIBLE ARGUMENTS]:");
    console.log("`modman install --version <minecraft version>` - download the package for a specified version");
}
exports.get_help = get_help;
function most_similar(s1, strs) {
    let best = "";
    for (const str of strs) {
        if (similarity(s1, str) > similarity(s1, best)) {
            best = str;
        }
    }
    return best;
}
exports.most_similar = most_similar;
function similarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    let longer_length = longer.length;
    if (longer_length == 0) {
        return 1.0;
    }
    return (longer_length - editDistance(longer, shorter)) / longer_length;
}
exports.similarity = similarity;
function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}
//# sourceMappingURL=util.js.map