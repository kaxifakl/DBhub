# DBhub
Use Github as a mini-database

# start

```js
npm i @movingcastle/dbhub
```

```typescript
test.ts
import { DBhub } from "@movingcastle/dbhub";

let db = new DBhub({
    authToken: 'xxxxxx',  //your github token
    dbs: [                //dbbase name or path
        "test"
    ],
    owner: "xxx",         //your github name
    repo: "xxx"           //your github repo name
})

db.connect(() => {
    //change some data
    db.setData('test', 'testabc', { num: 123456 })
    //sync this github db
    db.sync(()=>{
        console.log('finish')
    });
})
```

# create or delete

just create a file named `xxx.raw`

delete the file on github.com

# notice
Dont make the file too large, it will cause some problems