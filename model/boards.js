var mongoose = require('mongoose');  
var boardSchema = new mongoose.Schema({  
  boardName: String,
  boardDescription: String,
  createdBy: String
});
mongoose.model('Board', boardSchema);