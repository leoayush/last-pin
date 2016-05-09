var mongoose = require('mongoose');  
var pinSchema = new mongoose.Schema({  
  title: String,
  source: String,
  image: String,
  pinnedBy: String,
  boardID: String,
  description: String
});
mongoose.model('Pin', pinSchema);