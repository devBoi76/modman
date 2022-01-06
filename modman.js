#!/usr/bin/env nodejs
const cf = require("mc-curseforge-api");
const path = require("path");
const prompt = require("prompt-sync")({ sigint: true });

let addNoDuplicates = function(el, array){
	if(!array.includes(el)){
		array = array.concat(el);
	}
	return array;
}

function getModFilePromisesForVersion(modIds, game_version) {
	const game_version_arr = game_version.split(".");
	const modFilesPromises = modIds.map( async (id) => {
		answer = await cf.getModFiles(id);
		// filter out wrong versions and return newest one
		answer = answer.map( (c) => {
			gv = c.minecraft_versions;
			if(gv && !gv.includes("Fabric")){
				for(const g of gv){
					if(g == game_version || g.split(".").slice(0, 3) == game_version_arr.slice(0, 3)){
						return c;
					}
				}
			}
			return null;
		});
		answer = answer.filter((value) => {return value != null;});
		let newest_date = 0;
		let newest_idx = 0;
		
		for (let i = 0; i < answer.length; i++) {
			value = answer[i];
			date = Date.parse(value.timestamp);
			if(date > newest_date) {
				newest_date = date;
				newest_idx = i;
			}
		}
		answer = answer[newest_idx];
		return answer;
	});
	return modFilesPromises;
}

const args = process.argv;
const game_version = args[2];

mods = args.slice(3); // remove `node modman.js`
if(mods.length == 0){
	console.log("[ERROR] No mods to install")
	console.log("Install mods with `nodejs modman.js '1.16.5' 'JourneyMap' 'Storage Drawers' [...]")
}
console.log("Following mods to download:")
console.log(mods);

const modObjPromises = mods.map( async (mod_name) => {
	answer = await cf.getMods({ searchFilter: mod_name, gameVersion: game_version});
	if(answer.length != 0){
		return answer;
	}else {
		console.log("[ERROR] Mod Not Found: `"+mod_name+"`");
		return null;
	}
});
// NOTE: Do everything inside this function because js sucks
Promise.all(modObjPromises).then( (modObjs) => {

	// NOTE: `modIds` are the PROJECT ids not the FILE ids
	modIds = modObjs.map( (modObj) => {
		return modObj[0].id;
	});
	console.log("Mod IDs");
	console.log(modIds);
	modFilesPromises = getModFilePromisesForVersion(modIds, game_version);


	// at this point we have the resolved base mod file promises
	Promise.all(modFilesPromises).then( (modFiles) => {
		let installOptional = prompt("Do you want to install optional dependencies? [y/N]", "n").toString();
		installOptional = (installOptional == "y");
		
		let modDepIds = []; // just the IDs of the dependencies
		for(const modFile of modFiles){
			if(modFile.mod_dependencies.length != 0){
				for(const dependency of modFile.mod_dependencies){
					if(!installOptional){
						if(dependency.type != 2) { // is an optional type
							modDepIds = addNoDuplicates(dependency.addonId, modDepIds);
						}
					} else {
						modDepIds = addNoDuplicates(dependency.addonId, modDepIds);
					}
				}
			}
		}
		console.log("Dependency IDs")
		console.log(modDepIds)
		depFilePromises = getModFilePromisesForVersion(modDepIds, game_version);
		Promise.all(depFilePromises).then( (depFiles) => {
			allModFiles = modFiles.concat(depFiles);
			console.log(allModFiles);
			for(const modFile of allModFiles) {
				const mName = modFile.download_url.split("/").pop();
				modFile.download(path.join(__dirname,mName), true).catch( err => console.log(err + modFile.download_url));
			}
		});
	});
});
