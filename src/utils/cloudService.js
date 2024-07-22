import fs from "fs";
import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: 'dokgl6bfp', 
  api_key: '824439276387255', 
  api_secret: 'HgMNRom67gMBvkyHXpAjAC72OWc' 
});

const uploadOnCloudinary = async (localFilePath) => {
        console.log(localFilePath)
    try {
        if (!localFilePath) {
            return null
        } 
        //upload the file on cloudinary
       const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // file has been uploaded 
        console.log("file is uploaded", response.url);
        return response;
    } catch (error) {
        console.log(error)
        fs.unlinkSync(localFilePath) // remove locally saved file as the upload is failed
        return null
    }
}

export default uploadOnCloudinary