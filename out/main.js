#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
const util = __importStar(require("./util"));
const program = __importStar(require("./program"));
const packages = __importStar(require("./package"));
const configuration = __importStar(require("./configuration"));
const api = __importStar(require("./api"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        //ensure that a file at ./modman/conf.js is accesible
        program.ensure_file();
        // parse arguments
        const args = process.argv;
        const options = args.slice(2);
        if (options.length == 0) {
            util.print_error("No options provided");
            util.print_note(`Possible options: ${util.possible_options.join(", ")}`);
            process.exit();
        }
        if (!util.possible_options.includes(options[0])) {
            util.print_error(`Unknown option: \`${options[0]}\``);
            util.print_note(`Possible options: ${util.possible_options.join(", ")}`);
            process.exit();
        }
        // make configuration
        let parsed_args = configuration.parse_args(options); // removes options
        // let config = new configuration.Configuration(parsed_args.version, parsed_args.install_method);
        // console.log(parsed_args);
        // console.log(config);
        switch (parsed_args.operation) {
            case "install":
                console.log("install");
                if (parsed_args.pkg_names.length == 0) {
                    util.print_error("No packages to install");
                    util.print_note("example usage is `./main.js JEI`");
                    process.exit();
                }
                let known_packages = packages.read_pkg_json();
                let desired_pkg_names = parsed_args.pkg_names;
                let desired_pkg_objects = packages.names_to_objects(desired_pkg_names, known_packages); // Set
                let desired_releases = new Set();
                for (const entry of desired_pkg_objects.entries()) {
                    let r = packages.get_desired_release(entry[0], parsed_args.version);
                    r.is_dependency = false;
                    desired_releases.add(r);
                }
                // resolve dependencies
                for (const rel of desired_releases) {
                    for (const dep of rel.deps) {
                        let p = packages.id_to_object(dep.pkg_id, known_packages);
                        let r = p.releases.filter((value) => value.id == dep.release_id)[0];
                        r.is_dependency = true;
                        desired_releases.add(r);
                    }
                }
                util.print_note("Packages to install:");
                desired_releases.forEach((value) => {
                    util.print_release(value, known_packages);
                    api.download_release(value, known_packages);
                });
                break;
            case "sync":
                console.log("sync");
                api.sync_all_repos();
                break;
            case "add_repo":
                if (parsed_args.pkg_names.length == 0) {
                    util.print_error("No repositories to add specified");
                    process.exit();
                }
                api.add_repos(parsed_args.pkg_names);
                break;
            case "remove_repo":
                if (parsed_args.pkg_names.length != 1) {
                    util.print_error("Please specify exactly one repository to remove");
                    process.exit();
                }
                api.remove_repo(parsed_args.pkg_names[0]);
            case "create_package":
                if (parsed_args.pkg_names.length != 3) {
                    util.print_error("Please provide a name and description for the package in the following format:");
                    util.print_error("`create_package <repository_url> <name> <description>`");
                    process.exit();
                }
                api.create_package(parsed_args.pkg_names[0], parsed_args.pkg_names[1], parsed_args.pkg_names[2]);
                break;
            case "create_release":
                if (parsed_args.pkg_names.length != 5) {
                    util.print_error("Please provide a name and description for the release in the following format:");
                    util.print_error("`create_package <repository_url> <release_version> <game_version> <dependencies> <repository_package_id>`");
                    process.exit();
                }
                api.create_release(parsed_args.pkg_names[0], parsed_args.pkg_names[1], parsed_args.pkg_names[2], parsed_args.pkg_names[3], parsed_args.pkg_names[4]);
                break;
            case "upload_release":
                if (parsed_args.pkg_names.length != 4) {
                    util.print_error("Please provide a name and description for the release file in the following format:");
                    util.print_error("`create_package <repository_url> <file_path> <repository_package_id> <release_id>`");
                    process.exit();
                }
                api.upload_release_file(parsed_args.pkg_names[0], parsed_args.pkg_names[1], parsed_args.pkg_names[2], parsed_args.pkg_names[3]);
                break;
            case "help":
                util.get_help();
                break;
        }
    });
}
main();
//# sourceMappingURL=main.js.map