import * as packages from "./package"

export class installed {
    locators: Array<packages.InstalledLocator>
    constructor() {
        this.locators = []
    }
}

export class config {
    game_version: string;
    repos: Array<packages.Repository>;
    search_modrinth: boolean;
    constructor() {
        this.game_version = "1.16.5";
        this.repos = [];
        this.search_modrinth = false;
    }
}