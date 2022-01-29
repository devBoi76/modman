
import * as fs from "fs"
import * as configuration from "./configuration"
import * as util from "./util"
import * as filedef from "./filedef"
import * as interfaces from "./interfaces"
var prompt = require('prompt-sync')();

export class Locator implements interfaces.LocatorData {
    // The locator is a unique locator to a specific package version
    // It contains the full URL of the repository, so that it can be resolved even if someone hasn't added that repository
    repo: string;
    slug: string;
    rel_id: number;

    constructor(repo: string, slug: string, rel_id: number) {
        this.repo = repo
        this.slug = slug
        this.rel_id = rel_id
    }

    static from_short_slug(sslug: string) {
        let split = sslug.split("->");
        let rel_id = split.pop();
        let slug = split.pop();
        let repo = split.pop();
        // util.print_debug([sslug, split, rel_id, slug, repo])
        return new this(repo, slug, Number(rel_id))
    }

    get short_slug() {
        return `${this.repo}->${this.slug}->${this.rel_id}`
    }
}

export class InstalledLocator extends Locator implements interfaces.InstalledLocatorData {
    updated: number; // unix timestamp ms format
    constructor(repo: string, slug: string, rel_id: number, updated: number) {
        super(repo, slug, rel_id)
        this.updated = updated
    }
}

export function locator_to_release(ldata: interfaces.LocatorData, known_packages: Array<interfaces.PackageData>): interfaces.ReleaseData {
    // util.print_debug([locator.repo])
    let locator = new Locator(ldata.repo, ldata.slug, ldata.rel_id);
    known_packages = known_packages.filter( (pkg) => {return pkg.repository == locator.repo})
    if (known_packages.length == 0) {
        util.print_error(`Repository ${locator.repo} not found`);
        process.exit();
    }
    known_packages = known_packages.filter( (pkg) => {return pkg.slug == locator.slug})
    if (known_packages.length == 0) {
        util.print_error(`Package ${locator.repo}->${locator.slug} not found`);
        process.exit();
    }
    let rel: interfaces.ReleaseData = undefined 
    try {
        rel = known_packages[0].releases[locator.rel_id]
    } catch (err) {
        util.print_error(`Release ${locator.short_slug} not found`)
        process.exit();
    }
    return rel
}

export function locator_to_package(ldata: interfaces.LocatorData, known_packages: Array<interfaces.PackageData>): interfaces.PackageData {
    // util.print_debug([locator.short_slug, locator.repo])
    known_packages = known_packages.filter( (pkg) => {return pkg.repository == ldata.repo})
    if (known_packages.length == 0) {
        util.print_error(`Repository ${ldata.repo} not found`);
        process.exit();
    }
    known_packages = known_packages.filter( (pkg) => {return pkg.slug == ldata.slug})
    if (known_packages.length == 0) {
        util.print_error(`Package ${ldata.repo}->${ldata.slug} not found`);
        process.exit();
    }
    return known_packages[0]
}

// When we parse the package JSON to an object, the object doesn't have any function as JSON doesn't store them, so we have to do this
export function get_total_downloads(pkg: interfaces.PackageData) {
    let all = 0;
    if(pkg.releases.length == 0) {
        return all;
    }
    for(const rel of pkg.releases) {
        all += rel.downloads;
    }
    return all;
}


export function read_installed_json(fold: string): interfaces.Installed {
    let json: interfaces.Installed = undefined
    try {
        let file = fs.readFileSync(fold+"/installed.json", "utf8")
        json = JSON.parse(file)
    } catch (err) {
        json
    }
    return json
}

export function names_to_objects(package_names: Array<string>, known_packages: any, exit: boolean): Set<interfaces.PackageData> {
    // also filters for slugs
    let objects = new Set<interfaces.PackageData>();
    for(const name of package_names) {
        let pkgs = known_packages.filter(pkg => pkg.name.toLowerCase() == name.toLowerCase() || pkg.slug == name.toLowerCase());
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

export function get_desired_release(pkg: interfaces.PackageData, game_version: string, release_version?: string): interfaces.ReleaseData {
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

export function unify_indexes(indexes: Array<Array<interfaces.PackageData>>) {
    let unified_index: Array<interfaces.PackageData> = []
    for(const index of indexes) {
        for(const pkg of index) {
            unified_index.push(pkg);
        }
    }
    return unified_index;
}

export function check_if_installed(release: interfaces.ReleaseData, fold: string, known_packages: Array<interfaces.PackageData>): boolean {
    let installed = read_installed_json(fold)
    let ppkg = locator_to_package(Locator.from_short_slug(release.parent_locator), known_packages)
    let a = installed.locators.filter( loc => loc.slug == ppkg.slug )

    return a.length > 0
}

export function add_as_installed(release: interfaces.ReleaseData, fold: string, known_packages: Array<interfaces.PackageData>) {
    let file = read_installed_json(fold)

    let locator = Locator.from_short_slug(release.parent_locator);
    if (!(file.locators.map(loc => loc.repo + loc.slug).includes(locator.repo + locator.slug))) {
        let installed_locator = new InstalledLocator(locator.repo, locator.slug, locator.rel_id, Date.now())
        file.locators.push(installed_locator);
    } else {
        let idx = file.locators.findIndex( loc => loc.repo + loc.slug == locator.repo + locator.slug)
        file.locators[idx].updated = Date.now() // update last checked
    }
    fs.writeFileSync(fold+"/installed.json", JSON.stringify(file))
}