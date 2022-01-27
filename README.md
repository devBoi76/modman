# `modman`
## About
---
Modman is a manager for minecraft mods. Instead of clicking through hundreds of curseforge pages to download all of your desired mods and dependencies, you can now install them all from the comfort of your terminal.

## NOTE: Modman is still in early development and much is subject to change.

## Modrinth integration

To enable searching through modrinth, set `search_modrinth` to `true` in `.modman/conf.json`

## Curseforge integraion

For now you'll have to use the [proxy server](https://github.com/devBoi76/modman-server-cfproxy) which is still very much WIP
To add a package to track, add the curseforge ID to `cf_ids` in `assets/pkgs_to_track.json` after you run the server once

