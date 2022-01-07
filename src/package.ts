
const fs = require("fs");
import * as util from "./util"

export class Release {
    id: number;
    version: string;
    game_version: string;
    deps: Array<Dependency>;
    parent_package_id: number;
    released: number; // utc timestamp
    is_dependency: boolean;
}

export class Dependency {
    pkg_id: number;
    release_id: number;
}

export class Package {
    id: number;
    name: string;
    description: string;
    releases: Array<Release>;
    repository: string;
    repository_id: number;
}

export function read_pkg_json() {

    let file: string = undefined;
    let json: JSON = undefined;
    try {
        file = fs.readFileSync("./.modman/pkg_idx.json", "utf8");
        json = JSON.parse(file);
    } catch (err) {
        console.log("Could not read ./.modman/pkg_idx.json");
        console.log(err);
        throw("Could not read ./.modman/pkg_idx.json");
    }
    return json;
}

export function names_to_objects(package_names: Array<string>, known_packages: any): Set<Package> {
    let objects = new Set<Package>(); // we can use Array.filter() ! IDK about the performance though
    
    for(const name of package_names) {
        let pkg = known_packages.filter(pkg => pkg.name.toLowerCase() == name.toLowerCase())[0]
        if(pkg){
            objects.add(pkg);
        } else {
            util.print_error(`Package "${name}" not found`);
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
            process.exit();
        }
    }
    return objects;
}

export function id_to_object(id: number, known_packages: any): Package {
    return known_packages.filter(pkg => pkg.id === id)[0];    
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
    let total_ids: number = 0;
    let unified_index: Array<Package> = []
    for(const index of indexes) {
        for(const pkg of index) {
            pkg.id = id_counter;
            unified_index.push(pkg);
            id_counter += 1;
        }
    }

    return unified_index;

}