import dbServices from "./dbServices";

class nodeServices{
    dbServices:dbServices;

    constructor(){
        this.dbServices=new dbServices();
    } 
    
    getAllNodes(){
        return this.dbServices.fetchData();
    }

    getNodeById(id:number){
        return this.dbServices.fetchData();
    }

    addNode(node:Node){
        return this.dbServices.addData(node);
    }

    deleteNode(id:number){
        return this.dbServices.deleteData(id);
    }

    updateNode(id:number){
        return this.dbServices.updateData(id);
    }
}

export default nodeServices;