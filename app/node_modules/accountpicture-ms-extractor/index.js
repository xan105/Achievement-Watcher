'use strict';

const fs = require('fs');
const path = require('path');

const marker = {
    jpeg : {
      header : Buffer.from('FFD8','hex'),
      jfif : Buffer.from('FFE0','hex'),
      trailer: Buffer.from('FFD9','hex')
    },
    png : {
      header: Buffer.from('89504E470D0A1A0A','hex'),
      trailer: Buffer.from('49454E44','hex'),
      trailerOffset: 8 //four byte CRC
    }
};

module.exports = (filePath) => { 
  return new Promise((resolve, reject) => {
  
    try { 
      if (path.parse(filePath).ext !== ".accountpicture-ms") {
        return reject("Not an .accountpicture-ms file !");
      }
    }catch(err) {
      return reject(err);
    }
  
    fs.readFile(filePath,function(err,data){
      if (err) {
        return reject(err);
      } else {
        try
          {
              let result;
              try {
                result = extract(data,marker.png.header,marker.png.trailer,marker.png.trailerOffset); //New format : PNG embedded in .accountpicture-ms
                result.type = "png";
              }catch(err){ //If failed; Fallback to old format
                result = extract(data,Buffer.concat([marker.jpeg.header,marker.jpeg.jfif]),marker.jpeg.trailer); //Old format : JPEG embedded in .accountpicture-ms
                result.type = "jpeg";
              }
              
              if(result) {
                return resolve(result);
              } else {
                return reject("Unexpected empty extraction");
              }

        }catch(err){
          return reject(err);
        }
      } 
    });
    
  });
}

/* 
data: buffer
header: Buffer
trailer: Buffer
offset: int
*/  
function extract(data,header,trailer,offset = 0) {
  
  /*Data as a hex string. Split string with marker */
  let content = data.toString('hex').split(header.toString('hex'));
  
  if (content.length !== 3) throw "Unexpected file content !";

  trailer = trailer.toString('hex');

  //Look for the last occurence of the trailer mark in the string
  let trailerPos = {
       small: content[1].lastIndexOf(trailer) + trailer.length + offset,
       big: content[2].lastIndexOf(trailer) + trailer.length + offset 
  };
        
  //Generating valid file with header and marker     
  let extracted = {
      small : Buffer.concat([header,Buffer.from(content[1].slice(0, trailerPos.small ),'hex')]),
      big : Buffer.concat([header,Buffer.from(content[2].slice(0, trailerPos.big),'hex')])
  }
  
  return extracted;

}