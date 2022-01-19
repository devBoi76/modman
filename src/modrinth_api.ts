import * as packages from "./package";
import * as util from "./util"
import * as https from "https"
import * as fs from "fs"
import fetch from "node-fetch";
const api_url = "https://api.modrinth.com"

export class ModResult {
    mod_id: string;
    project_type: string;
    author: string;
    title: string;
    description: string;
    categories: Array<string>;
    versions: Array<string>;
    downloads: number;
    page_url: string;
    icon_url: string;
    author_url: string;
    date_created: string; // date that can be parsed by Date()
    date_modified: string;
    latest_version: string;
    license: string;
    client_side: string;
    server_side: string;
    host: string;
}

export class Version {
    id: string;
    mod_id: string;
    author_id: string;
    featured: string;
    name: string;
    version_number: string;
    date_published: string;
    downloads: number;
    version_type: string;
    files: Array<VersionFile>;
    dependencies: Array<string>;
    game_versions: Array<string>;
    loaders: Array<string>;
}

export class VersionFile {
    url: string;
    filename: string;
}

export class ModirinthPackage extends packages.Package {
    versions: Array<Version>;
    modirinth_id: string;
    downloads: number;
    
    constructor(id: string, name: string, description: string, versions: Array<Version>, downloads: number) {
        super(-1, name, description, [], "modrinth", -1);
        this.modirinth_id = id;
        this.versions = versions;
        this.downloads = downloads;
    }
}

export function search_mod(query: string, version: string): Array<ModResult> {
    let mod_results = util.get_sync(`${api_url}/api/v1/mod?query=${query}&&versions="version=${version}"`);
    mod_results = JSON.parse(mod_results);
    let j_res: Array<ModResult> = mod_results.hits;
    if(j_res.length == 0) {
        util.print_error("Could not find any packages on modrinth");
        process.exit();
    }
    j_res = j_res.filter( (mod) => { return util.similarity(mod.title, query) > 0.6});
    return j_res;
}

export async function search_mods(query: Array<string>, version: string, give_prompt: boolean): Promise<Array<ModResult>> {
    let promises = new Array<Promise<Response>>();
    
    for(const q of query) {
        promises.push(fetch(`${api_url}/api/v1/mod?query=${q}&&versions="version=${version}"`));
    }
    
    let resolved_promises = await Promise.all(promises);
    
    let hits = new Array();
    for(let i = 0; i <  resolved_promises.length; i++) {
        hits.push(await resolved_promises[i].json());
    }
    let mods = hits.flatMap( (hit) => {
        return hit.hits;
    });

    // let j_res: Array<ModResult> = mod_results.hits;
    if(mods.length == 0) {
        util.print_error("Could not find any packages on modrinth");
        process.exit();
    }
    
    // TODO: make this better
    mods = mods.filter( (mod) => { 
        let best_match = util.most_similar(mod.title, query);
        let sim = util.similarity(mod.title, best_match);
        if(sim > 0.9 || !give_prompt && sim > 0.7) {
            return true
        } else if (sim > 0.6 && give_prompt) {
            return util.ask_user(`A similar match to "${best_match}" found, did you mean "${mod.title}" ?`, ['y', 'n'], 'y') == 'y';
        }
        false
    });
    return mods;
}

export function modrinth_to_internal(mod_res: ModResult): ModirinthPackage {
    let versions = get_mod_versions(mod_res.mod_id.replace("local-", ""));
    return new ModirinthPackage(mod_res.mod_id, mod_res.title, mod_res.description, versions, mod_res.downloads);
}

export function get_mod_versions(mod_id: string): Array<Version> {
    let a = util.get_sync(`${api_url}/api/v1/mod/${mod_id.replace("local-", "")}/version`)
    return JSON.parse(a);
}

export function get_mod_version(version_id: string) {
    return util.get_sync(`${api_url}/api/v1/version/{version_id}`);
}

export function print_package(pkg: ModirinthPackage) {
    let releases = pkg.versions;
    console.log(`${util.colors.BgYellow}${util.colors.FgBlack}[External Package]${util.colors.Reset} ${pkg.name} - ${pkg.description}`);
    console.log(`| Total Downloads: ${pkg.downloads} | Repository: ${pkg.repository}`);
    console.log(`| Releases:`);
	if(releases.length == 0) {
		console.log("| No releases found\n");
		return;
	}
    let visible = releases.slice(0, 6);
	for(const release of visible) {
		console.log(`|> Version ${release.version_number} for Minecraft ${release.game_versions.join(", ")} (${release.downloads})`);
	}
    if(releases.length - visible.length > 0) {
        console.log(`| And ${releases.length - visible.length} more..`);
    }
    console.log("");
}

export function print_version(version: Version) {
    console.log(`${util.colors.BgYellow}${util.colors.FgBlack}[External Release]${util.colors.Reset} ${version.name}`);
}

// NOTE: This function will be slow, the biggest delay is waiting for modrinth. 
// It is only making one request per package which seems reasonable.
export function get_desired_release(pkg: ModResult, game_version: string): Version {
    let all_vers = get_mod_versions(pkg.mod_id);
    all_vers = all_vers.filter ( (version) => {
        for(const gver of version.game_versions) {
            if(packages.release_compatible(gver, game_version)) {
                return true;
            }
        }
        return false;
    });
    return all_vers.sort( (ver1, ver2) => {return Date.parse(ver2.date_published) - Date.parse(ver1.date_published)})[0]
}

export function download_release(release: Version, mods_folder: Array<string>) {
    const file = fs.createWriteStream("/"+mods_folder.join("/")+"/"+ release.files[0].filename);
    https.get(release.files[0].url, (response) => {
        response.pipe(file);
    });
}
