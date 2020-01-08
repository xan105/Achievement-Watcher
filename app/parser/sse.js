'use strict';

module.exports.parse = (buffer) => {
  try{

    const header = buffer.slice(0, 4);
    const entryCount = parseInt(header.slice(0,1).reverse().toString('hex'),16);
    
    const data = bufferSplit( buffer.slice(header.length, buffer.length), 24);
    if (data.length !== entryCount) throw "Unexpected file content";
    
    let result = [];
    
    for (let entry of data) 
    {  
        try{
        
          let value = parseInt(entry.slice(20,21).toString('hex'),16);

          if ( value === 1 ) {
          
            result.push({
                crc: entry.slice(0,4).reverse().toString('hex'),
                Achieved : value,
                UnlockTime: parseInt(entry.slice(8, 12).reverse().toString('hex'),16)
            });
          
          } else {
            throw "Not an achievement but a stat";
          }
          
        }catch(err){
          //Do nothing
        }
    }
    
    return result;
  
  }catch(err){
    throw err;
  }
}

function bufferSplit(buffer,n){

  let result = [];
  for (let i = 0, j = 1; i < buffer.length; i += n, j++) {
    result.push(buffer.slice(i,n*j));    
  }
  return result;

}