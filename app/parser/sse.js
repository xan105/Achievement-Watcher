'use strict';

function parse(buffer) {

	if (!Buffer.isBuffer(buffer)) throw "ENOTABUFFER";

    const header = buffer.slice(0, 4);
    const statsCount = toInt(header.slice(0,1));
    const statsLength = 24; //Each entries are 24 bytes long
    
    const stats = bufferSplit(buffer.slice(header.length, buffer.length), statsLength);
    if (stats.length !== statsCount) throw "EUNEXPECTEDFILECONTENT";
    
    let result = [];
    
    for (let i = 0; i < stats.length; i++)
    {  
        try{
        
          const value = toInt(stats[i].slice(20,21));
          if ( value === 1 )  //is an achievement or a stat when 0 or 1; is a stat 100% when > 1; NB: a stat has also an unlocktime with sse
          {
            result.push({
                crc: toString(stats[i].slice(0,4)),
                Achieved : value,
                UnlockTime: toInt(stats[i].slice(8, 12))
            });
          }
          
        }catch{ /* Do nothing */ }
    }
    
    return result;
}

function toString(buffer){
	return buffer.reverse().toString('hex');
}

function toInt(buffer) {
	return parseInt(buffer.reverse().toString('hex'),16);
}

function bufferSplit(buffer, n){
  let result = [];
  for (let i = 0, j = 1; i < buffer.length; i += n, j++) result.push(buffer.slice(i,n*j));
  return result;
}

module.exports = { parse };