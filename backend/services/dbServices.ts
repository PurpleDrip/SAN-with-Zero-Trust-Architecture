interface dbServices{
    fetchData():null;
    addData(node:Node):null;
    deleteData(id:number):null;
    updateData(id:number):null;
    clearData():null;
}

export default dbServices;