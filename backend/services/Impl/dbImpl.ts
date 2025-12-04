import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'


class dbServices{

    db:Low;

    constructor(){
        this.db=new Low(new JSONFile('db.json'), { nodes: [] });
    }

    fetchData(){
        return this.db.read();
    }

    addData(node:Node){
        this.db.write();
    }

    deleteData(id:number){
        this.db.write();
    }

    updateData(id:number){
        this.db.write();
    }

    clearData(){
        this.db.write();
    }
}

export default dbServices;