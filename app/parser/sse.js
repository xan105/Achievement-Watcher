'use strict';

function parse(buffer) {

	if (!Buffer.isBuffer(buffer)) throw "ERR_INVALID_ARGS";

    const length = 24; //Each entries are 24 bytes long
    const header = buffer.slice(0, 4);
    
    const stats = bufferSplitIntoChuncks(buffer.slice(header.length, buffer.length), length);
    const expectedStatsCount = header.readInt32LE();
    if (stats.length !== expectedStatsCount) throw "ERR_UNEXPECTED_STATS_COUNT";
    
    let result = [];
    
    for (let i = 0; i < stats.length; i++)
    {  
        try{
        
          const value = stats[i].slice(20,24).readInt32LE();
          if ( value > 1 ) continue  //is an achievement or a stat when 0 or 1; is a stat 100% when > 1; NB: a stat has also an unlocktime with sse
          
          result.push({
            crc: stats[i].slice(0,4).reverse().toString('hex'), //api_name is a CRC32
            Achieved : value,
            UnlockTime: stats[i].slice(8,12).readInt32LE()
          });
          
        }catch{ continue }
    }
    
    return result;
}

//splitting a buffer into n-sized chunks
function bufferSplitIntoChuncks(buffer, n){
  let result = [];
  for (let i = 0, j = 1; i < buffer.length; i += n, j++) 
    result.push(buffer.slice(i, n*j));
  return result;
}

module.exports = { parse };