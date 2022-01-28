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
exports.point_to_modman_folder = exports.point_to_mods_folder = void 0;
const fs = __importStar(require("fs"));
function point_to_mods_folder() {
    let cwd = process.cwd().split("/");
    if (cwd[cwd.length - 1] == ".minecraft" || cwd[cwd.length - 1] == "minecraft") { // inside .minecraft, point to .minecraft/mods
        cwd.push("mods");
        // util.print_debug(`cwd is ${cwd.join("/")}`)
        return cwd.join("/");
    }
    else {
        // util.print_debug(`cwd is ${cwd.join("/")}`)
        return cwd.join("/");
    }
}
exports.point_to_mods_folder = point_to_mods_folder;
function point_to_modman_folder() {
    let cwd = process.cwd();
    let to_check = ["./.modman", "../.modman"]; // ordered in priority, eg. if the directory abobve has .modman, but the current one also does, pick the current one
    let path = ""; // return "" if its not found
    for (const fpath of to_check) {
        try {
            let _ = fs.accessSync(fpath);
            path = cwd + "/" + fpath;
        }
        catch (err) { }
    }
    return path;
}
exports.point_to_modman_folder = point_to_modman_folder;
//# sourceMappingURL=context.js.map