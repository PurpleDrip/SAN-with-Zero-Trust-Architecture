interface nodeServices{
    getAllNodes():null;
    getNodeById(id:number):null;
    addNode(node:Node):null;
    deleteNode(id:number):null;
    updateNode(id:number):null;
}

export default nodeServices;