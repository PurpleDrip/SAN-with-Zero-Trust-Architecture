const express=require('express');
const router=express.Router();
const nodeController=require('../controllers/nodeController');

router.get('/users', nodeController.getAllUsers);
router.get('/users/:id', nodeController.getUsersById);

module.exports=router;
