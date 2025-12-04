import express from "express";


const nodeController={
    getAllNodes: (req:any,res:any)=>{
        return res.status(200).json({message:"All nodes"})
    },
    getNodeById: (req:any,res:any)=>{
        return res.status(200).json({message:"Node by id"})
    }
}

export default nodeController
