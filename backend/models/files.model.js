import mongoose from 'mongoose';

const filesSchema = new mongoose.Schema({
    publicId : {type: String, required: true, unique: true},
    ownerId : {type: String, required: true},
    originalName : {type: String, required: true},
    storedPath : {type: String, required: true},
    mimeType : {type: String, required: true},
    sizeBytes : {type: Number, required: true},
})

const FileModel = mongoose.model("FileModel", filesSchema);

export default FileModel;