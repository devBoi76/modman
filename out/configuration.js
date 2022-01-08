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
exports.ensure_repos = exports.ensure_file = exports.parse_args = void 0;
const fs = __importStar(require("fs"));
const util = __importStar(require("./util"));
const api = __importStar(require("./api"));
function parse_args(options) {
    let parsed_args = {
        operation: "install",
        version: "1.16",
        install_method: "latest",
        words: []
    };
    while (options.length != 0) {
        let o = options.shift();
        switch (o) {
            case (util.possible_args.VERSION): {
                let val = options.shift();
                if (val == undefined) {
                    util.print_error("No game version given");
                    util.print_note("Correct usage is for example `--version \"1.16.5\"`");
                    process.exit();
                }
                parsed_args.version = val;
                break;
            }
            case (util.possible_args.INSTALL_METHOD): {
                let val = options.shift();
                if (val == undefined || !["latest", "top", "pick"].includes(val)) {
                    util.print_error("No valid install method given");
                    util.print_note("Possible install methods: latest, top, pick");
                    util.print_note("Correct usage is for example `--method latest`");
                    process.exit();
                }
                parsed_args.install_method = val;
                break;
            }
            default:
                if (util.possible_options.includes(o)) {
                    parsed_args.operation = o;
                    break;
                }
                parsed_args.words = parsed_args.words.concat(o);
                break;
        }
    }
    return parsed_args;
}
exports.parse_args = parse_args;
function create_template_file() {
    // const writer = fs.createWriteStream("./.modman/conf.json", {flags: "w"});
    const default_json = {
        game_version: "1.16",
        repos: [],
        search_modrinth: false
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
function ensure_file() {
    try {
        try {
            fs.accessSync("./.modman");
        }
        catch (err) {
            fs.mkdirSync("./.modman");
        }
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
;
function ensure_repos() {
    let config = JSON.parse(fs.readFileSync("./.modman/conf.json", "utf8"));
    if (config.repos.length == 0) {
        util.print_error("You haven't added any repositories");
        util.print_error("Add one with `modman add_repo <repository_url>`");
        process.exit();
    }
}
exports.ensure_repos = ensure_repos;
//# sourceMappingURL=configuration.js.map