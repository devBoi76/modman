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
exports.ensure_file = exports.resolve_deps = exports.install = void 0;
const util = require("./util");
const fs = __importStar(require("fs"));
const api = __importStar(require("./api"));
function create_template_file() {
    // const writer = fs.createWriteStream("./.modman/conf.json", {flags: "w"});
    const default_json = {
        version: 0.1,
        fpath: fs.realpath("./.modman/conf.json", () => { }),
        repos: []
    };
    fs.writeFileSync("./.modman/conf.json", JSON.stringify(default_json));
}
;
function create_template_idx_file() {
    // const writer = fs.createWriteStream("./.modman/pkg_idx.json", {flags: "w"});
    // writer.write(api.get_available_packages("http://localhost:5000"));
    fs.writeFileSync("./.modman/pkg_idx.json", api.get_available_packages("http://localhost:5000"));
}
;
function install(packages) {
    util.print_error("Not implemented");
}
exports.install = install;
function resolve_deps(packages) {
    let all_pkgs = new Set();
    util.print_error("Not implemented");
    for (const pkg of packages) {
        all_pkgs.add(pkg);
    }
    return all_pkgs;
}
exports.resolve_deps = resolve_deps;
function ensure_file() {
    try {
        try {
            fs.accessSync("./.modman/conf.json");
        }
        catch (err) {
            // console.error(err);
            create_template_file();
        }
        try {
            fs.accessSync("./.modman/pkg_idx.json");
        }
        catch (err) {
            // console.error(err);
            create_template_idx_file();
        }
    }
    catch (err) {
        console.error(err);
    }
}
exports.ensure_file = ensure_file;
//# sourceMappingURL=program.js.map