const util = require("./util");

export const packageBehavior = {
    LATEST: 1,
    TOP: 2,
    PICK: 3
};

export class Configuration {
    game_version: string;
    behavior: number;
    constructor(version:string, behavior: number) {
        this.game_version = version;
        this.behavior = behavior;
    }
}

export function parse_args(options: Array<string>) {
    let parsed_args = {
        operation: "install",
		version: "1.16",
		install_method: "latest",
        pkg_names: []
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
                parsed_args.pkg_names = parsed_args.pkg_names.concat(o);
                break;
		}
	}
    return parsed_args;
}

// let a = new Configuration("1.2.3", packageBehavior.LATEST);