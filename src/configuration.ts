import * as fs from "fs"
import * as util from "./util"
import * as api from "./api"
import * as context from "./context"


export function parse_args(options: Array<string>) {
    let parsed_args = {
        operation: "install",
		version: "1.16",
		install_method: "latest",
        words: [],
		mods_folder: "",
		config_folder: ""
	};
	while(options.length != 0){
		let o = options.shift()
		switch(o) {
			case(util.possible_args.VERSION): {
				let val = options.shift();
				if(val == undefined) {
					util.print_error("No game version given");
					util.print_note("Correct usage is for example `--version \"1.16.5\"`");
					process.exit();
				}
				parsed_args.version = val;
			break;
			}
			case(util.possible_args.INSTALL_METHOD): {
				let val = options.shift();
				if(val == undefined || !["latest", "top", "pick"].includes(val)) {
					util.print_error("No valid install method given");
					util.print_note("Possible install methods: latest, top, pick")
					util.print_note("Correct usage is for example `--method latest`");
					process.exit();
				}
				parsed_args.install_method = val;
			break;
			}                
            
			default:
				if(util.possible_options.includes(o)) {
					parsed_args.operation = o;
                	break;
				}
                parsed_args.words = parsed_args.words.concat(o);
                break;
		}
	}
    return parsed_args;
}


function create_template_file(fold: string) {
	// const writer = fs.createWriteStream("./.modman/conf.json", {flags: "w"});
	const default_json = {
		game_version: "1.16",
		repos: [],
		search_modrinth: false
	};
	fs.writeFileSync(fold+"/conf.json", JSON.stringify(default_json));
};

function create_template_idx_file(fold: string) {
	// const writer = fs.createWriteStream("./.modman/pkg_idx.json", {flags: "w"});
	// writer.write(api.get_available_packages("http://localhost:5000"));
	fs.writeFileSync(fold+"/pkg_idx.json", api.get_available_packages("http://localhost:5000"))
};

export function ensure_file() { // do stuff if detectsa mods folder
	try {
		let fold = ""
		try {
			fold = context.point_to_modman_folder()
		} catch (err) {
			fold = ""
		}
		if(fold.length == 0) {
			fs.mkdirSync("./.modman")
			fold = context.point_to_modman_folder()
		}
		try {
			fs.accessSync(fold+"/conf.json");
		} catch (err) {
			// console.error(err);
			create_template_file(fold);
		}

		try {
			fs.accessSync(fold+"/pkg_idx.json");
		} catch (err) {
			// console.error(err);
			create_template_idx_file(fold);
		}
	} catch(err) {
		console.error(err);
	}
};

export function ensure_repos() {
	let fold = context.point_to_modman_folder()
	util.print_debug(fold)
	let config = JSON.parse(fs.readFileSync(fold+"/conf.json", "utf8"));
    if(config.repos.length == 0) {
        util.print_error("You haven't added any repositories");
        util.print_error("Add one with `modman add_repo <repository_url>`");
        process.exit();
    }
}