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

export class DBhub {
    public config: IConfig = null;
    public inited: boolean = false;
    public dbMap: Map<string, IDBData> = new Map();
    public octokit: Octokit = null;
    constructor(config: IConfig) {
        this.config = config;
        this.octokit = new Octokit({
            auth: this.config.authToken
        })
    }

    public connect(callBack: () => void) {
        let count = this.config.dbs.length;
        let finishCall = () => {
            count--;
            if (count <= 0) {
                console.log('DBhub');
                callBack();
            }
        }
        for (let db of this.config.dbs) {
            this.getDB(db, (sha, content) => {
                if (sha == null) {
                    this.createDB(db, (sha, content) => {
                        this.dbMap.set(db, { sha: sha, data: JSON.parse(content), dirty: false, path: db });
                        finishCall();
                    })
                } else {
                    this.dbMap.set(db, { sha: sha, data: JSON.parse(content), dirty: false, path: db });
                    finishCall();
                }
            })
        }
    }

    public getDB(path, cb) {
        this.octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
            owner: this.config.owner,
            repo: this.config.repo,
            path: path + '.raw'
        }).then((res: any) => {
            let content = res.data.content;
            let data = Buffer.from(content, 'base64').toString('utf-8');
            cb(res.data.sha, data)
        }).catch(err => {
            cb(null, null);
        })
    }

    public createDB(path, cb): void {
        this.octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
            owner: this.config.owner,
            repo: this.config.repo,
            path: path + '.raw',
            message: 'vercel',
            content: Buffer.from(JSON.stringify({}), 'utf-8').toString('base64')
        }).then(res => {
            cb(res.data.content.sha, "{}")
        }).catch(err => {
            cb(null, null)
        })
    }

    public sync(cb) {
        let array = [];
        this.dbMap.forEach((value, key) => {
            if (value.dirty) {
                array.push(value)
            }
        })

        let call = () => {
            let db = array.shift();
            if (db == null) {
                console.log('同步完成')
                cb?.();
                return;
            }
            db.dirty = false;
            let content = Buffer.from(JSON.stringify(db.data), 'utf-8').toString('base64');
            console.log('同步数据库：' + db.path)
            this.syncDB(db.path, db.sha, content, (result) => {
                if (db.dirty == true) {
                    call();
                } else {
                    db.dirty = !result;
                    call();
                }
            })
        }
        call();
    }

    public syncDB(path, sha, content, cb) {
        this.octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
            owner: this.config.owner,
            repo: this.config.repo,
            path: path + '.raw',
            message: 'DBhub',
            content: content,
            sha: sha
        }).then(res => {
            cb(true)
        }).catch(err => {
            cb(false)
        })
    }

    public setData(path, key, value) {
        let db = this.dbMap.get(path);
        let data = db.data;
        if (data[key] && data[key] == value) {
            return;
        }
        data[key] = value;
        db.dirty = true;
    }

    public getData(path, key) {
        let db = this.dbMap.get(path);
        let data = db.data;
        return data[key];
    }
}