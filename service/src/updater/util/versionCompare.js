"use strict";

module.exports.date = (local,remote, separator = "-") => { //DD-MM-YYYY

  let a = local.split(separator);
  let b = remote.split(separator);

  for(let i=0; i<3;i++) {
    a[i] = parseInt(a[i]);
    b[i] = parseInt(b[i]);
  }

      if (local[2] < remote[2]) { return true; }
      else if (local[2] == remote[2]) { 
                          
             if (local[1] < remote[1]) { return true; }
             else if (local[1] == remote[1]) { 
                          
                      if (local[0] < remote[0]) { return true; }
                      else { return false; } 
             }
             else { return false; } 
       }
       else { return false; }
}

module.exports.semver = (local,remote) => {

    const semver = /[0-9\.]+/g;

    let a = local.match(semver)[0].split('.');
    let b = remote.match(semver)[0].split('.');
    
    for (var i = 0; i < 3; i++) {
        let na = Number(a[i]);
        let nb = Number(b[i]);
        if (na > nb) return false;
        if (nb > na) return true;
        if (!isNaN(na) && isNaN(nb)) return false;
        if (isNaN(na) && !isNaN(nb)) return true;
    }
    return false;
    
}