
import * as fs from "fs"
import * as configuration from "./configuration"
import * as util from "./util"
var prompt = require('prompt-sync')();

export class Release {
    id: number;
    version: string;
    game_version: string;
    deps: Array<Dependency>;
    parent_package_id: number;
    released: number; // utc timestamp
    is_dependency: boolean;
    downloads: number;
    direct_link: string;
    prefer_link: boolean;
}

export class Dependency {
    pkg_id: number;
    release_id: number;
    repo: string;
}

export class Package {
    id: number;
    name: string;
    description: string;
    releases: Array<Release>;
    repository: string;
    repository_id: number;
    authors: Array<string>;
    slug: string;
    
    constructor(id: number, name: string, description: string, releases: Array<Release>, repository: string, repository_id: number) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.releases = releases;
        this.repository = repository;
        this.repository_id = repository_id;
    }
}

export class Repository {
    url: string;
    api_type: number; // 1 for normal, 2 for direct
    
    constructor(url:string, api_type: number) {
        this.url = url;
        this.api_type = api_type;
    }
}

// When we parse the package JSON to an object, the object doesn't have any function as JSON doesn't store them, so we have to do this
export function get_total_downloads(pkg: Package) {
    let all = 0;
    if(pkg.releases.length == 0) {
        return all;
    }
    for(const rel of pkg.releases) {
        all += rel.downloads;
    }
    return all;
}

export function read_pkg_json(conf_fold: string): Array<Package> {

    let file: string = undefined;
    let json: Array<Package> = undefined;
    configuration.ensure_repos();
    try {
        file = fs.readFileSync(conf_fold+"/pkg_idx.json", "utf8");
        json = JSON.parse(file);
    } catch (err) {
        util.print_error("Could not read "+ conf_fold+"/pkg_idx.json");
        util.print_note("Perhaps you haven't added any repositories. Consider adding one with `modman add_repo <repository url>`");
        process.exit();
    }
    if (json.length == 0) {
        util.print_error("No known packages found")
    }
    return json;
}

export function read_installed_json(fold: string) {
    let json = undefined;
    try {
        let file = fs.readFileSync(fold+"/installed.json", "utf8")
        json = JSON.parse(file)
    } catch (err) {
        json = {releases: []}
    }
    return json
}

export function names_to_objects(package_names: Array<string>, known_packages: any, exit: boolean): Set<Package> {
    let objects = new Set<Package>();
    for(const name of package_names) {
        let pkgs = known_packages.filter(pkg => pkg.name.toLowerCase() == name.toLowerCase());
            if(pkgs.length > 1) {
                util.print_note(`${pkgs.length} packages with the name ${name} found`);
                for (let i = 0; i < pkgs.length; i++) {
                    console.log(i+1);
                    util.print_package(pkgs[i]);
                }
                let selection = prompt(`Which package to install? [${util.range(1,pkgs.length, 1).join(", ")}]: `, 1);
                objects.add(pkgs[parseInt(selection)-1]);
            } else if (pkgs.length == 1) { // 1 package found
                objects.add(pkgs[0]);
            } else {
                util.print_error(`Package "${name}" not found in the native repositories`);
                let best_match = "";
                let k_names = known_packages.map( (value) => { return value.name.toLowerCase()});
                for(const name_b of k_names) {
                    if(util.similarity(name.toLowerCase(), name_b) > util.similarity(best_match, name_b)) {
                        best_match = name_b;
                    }
                }
                if (util.similarity(name, best_match) > 0.6) {
                    util.print_note(`Did you mean "${best_match}"?`);
                }
                if(exit) {
                    process.exit();
                }
            }  
         
    }
    return objects;
}

export function id_to_object(id: number, known_packages: Array<Package>): Package {
    return known_packages.filter(pkg => pkg.id === id)[0];    
}

export function repo_id_to_object(known_packages: Array<Package>, repo_id: number, repo?: string): Package {
    known_packages = known_packages.filter( (pkg) => {
        pkg.repository_id == repo_id
    });
    if(repo) {
        known_packages = known_packages.filter( (pkg) => {
            pkg.repository == repo
        });
    }
    return known_packages[0]
}

export function get_desired_release(pkg: Package, game_version: string, release_version?: string): Release{
    // NOTE: Uses `latest` unless a version is specified
    let options = pkg.releases.filter( (value) => {
        return release_compatible(value.game_version, game_version);
    });
    if(release_version) {
        options = options.filter( (value) => {
            return value.version == release_version
        });
    }

    let newest = options.sort( (a, b) =>{
        return b.released - a.released;
    });
    if(newest.length === 0) {
        util.print_error(`ERROR - package ${pkg.name} for version ${game_version} not found`);
        process.exit();
    }
    return newest[0]
}

export function release_compatible(release1: string, release2: string) {
    let arr1 = release1.split(".");
    let arr2 = release2.split(".");

    return (release1 == release2 || util.arr_eq(arr1.slice(0,2), arr2.slice(0,2)))
}

export function unify_indexes(indexes: Array<Array<Package>>) {
    let id_counter: number = 0;
    let unified_index: Array<Package> = []
    for(const index of indexes) {
        for(const pkg of index) {
            pkg.id = id_counter;
            for(let i = 0; i < pkg.releases.length; i++) {
                pkg.releases[i].parent_package_id = id_counter
            }
            unified_index.push(pkg);
            id_counter += 1;
        }
    }

    return unified_index;

}

export function add_as_installed(release: Release, fold: string) {
    let file = JSON.parse(fs.readFileSync(fold+"/installed.json", "utf8"))
    file.releases.push(release)
    fs.writeFileSync(fold+"/installed.json", JSON.stringify(file))
}