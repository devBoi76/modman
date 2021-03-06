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
exports.get_config = exports.default_config = exports.get_installed = exports.default_installed = exports.write = exports.get_index = void 0;
const util = __importStar(require("./util"));
const configuration = __importStar(require("./configuration"));
const fs = __importStar(require("fs"));
// This file is meant to define the layout of files that modman interfaces with and provide helper functions to interface with them
// It also contains some classes like `filedef.Package`. The main difference is that `filedef.Package` only contains the stored json fields, while `packages.Package` is a propper class with its own functions
function get_index(conf_fold) {
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
        process.exit(1);
    }
    if (json.length == 0) {
        util.print_error("No known packages found");
    }
    return json;
}
exports.get_index = get_index;
function write(file, name, fold) {
    switch (name) {
        case "installed":
            fs.writeFileSync(fold + "/installed.json", JSON.stringify(file));
            break;
        case "config":
            fs.writeFileSync(fold + "/conf.json", JSON.stringify(file));
            break;
    }
}
exports.write = write;
exports.default_installed = {
    locators: []
};
function get_installed(fold) {
    let file = undefined;
    let json = undefined;
    try {
        file = fs.readFileSync(fold + "/installed.json", "utf-8");
        json = JSON.parse(file);
    }
    catch (err) {
        util.print_error("Could not read " + fold + "/installed.json");
        console.error(err);
        process.exit(1);
    }
    return json;
}
exports.get_installed = get_installed;
exports.default_config = {
    game_version: "1.16.5",
    repos: [],
    search_modrinth: false
};
function get_config(fold) {
    let file = undefined;
    let json = undefined;
    try {
        file = fs.readFileSync(fold + "/conf.json", "utf-8");
        json = JSON.parse(file);
    }
    catch (err) {
        util.print_error("Could not read " + fold + "/conf.json");
        console.error(err);
        process.exit(1);
    }
    return json;
}
exports.get_config = get_config;
//# sourceMappingURL=filedef.js.map