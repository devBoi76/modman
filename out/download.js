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
exports.download_release = void 0;
const http = __importStar(require("http"));
const fs = __importStar(require("fs"));
const package_1 = require("./package");
function download_release(release, known_packages) {
    let parent_pkg = package_1.id_to_object(release.parent_package_id, known_packages);
    const file = fs.createWriteStream(parent_pkg.name + "_" + release.game_version + "_v_" + release.version + ".jar");
    const request = http.get(`${parent_pkg.repository}/get_file/${parent_pkg.repository_id}/${release.id}`, (response) => {
        response.pipe(file);
    });
}
exports.download_release = download_release;
//# sourceMappingURL=download.js.map