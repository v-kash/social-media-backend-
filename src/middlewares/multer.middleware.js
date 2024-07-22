import multer from "multer";


// file object in desti and file function hold the info about file being uploaded

const storage = multer.diskStorage({
    destination: function (req, file, cb) { 

      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {

      cb(null, file.originalname)
    }
  })
  
 export const upload = multer({ storage: storage })

  //C:\Users\vikas\OneDrive\Desktop\node js practise\public\temp