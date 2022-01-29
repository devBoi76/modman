export interface PackageData {
    name: string;
    description: string;
    releases: Array<ReleaseData>;
    repository: string;
    authors: Array<string>;
    slug: string;
}

export interface ReleaseData {
    id: number;
    version: string;
    game_version: string;
    deps: Array<string>; // short slugs of locators
    parent_locator: string; // short slug with the release id of this release
    released: number; // utc timestamp
    updated?: number;
    is_dependency: boolean;
    downloads: number;
    direct_link: string;
    prefer_link: boolean;
}

export interface RepositoryData {
    url: string;
    api_type: number; // 1 for normal, 2 for direct
}

export interface LocatorData {
    repo: string;
    slug: string;
    rel_id: number;
}

export interface InstalledLocatorData extends LocatorData{
    updated: number; // unix timestamp ms format
}

export interface Installed {
    locators: Array<InstalledLocatorData>
}

export interface Config {
    game_version: string;
    repos: Array<RepositoryData>;
    search_modrinth: boolean;
}