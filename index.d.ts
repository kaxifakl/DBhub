import { Octokit } from '@octokit/core';
interface IConfig {
    authToken: string;
    owner: string;
    repo: string;
    dbs: string[];
}
interface IDBData {
    sha: string;
    data: any;
    dirty: boolean;
    path: string;
}
export declare class DBhub {
    config: IConfig;
    inited: boolean;
    dbMap: Map<string, IDBData>;
    octokit: Octokit;
    constructor(config: IConfig);
    connect(callBack: () => void): void;
    getDB(path: any, cb: any): void;
    createDB(path: any, cb: any): void;
    sync(cb: any): void;
    syncDB(path: any, sha: any, content: any, cb: any): void;
    setData(path: any, key: any, value: any): void;
    getData(path: any, key: any): any;
}
export {};
