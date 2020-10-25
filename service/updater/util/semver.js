"use strict";

module.exports = (a,b) => {

    const exp = /[0-9\.]+/g;

    a = a.toString().match(exp)[0].split('.');
    b = b.toString().match(exp)[0].split('.');
    
    for (let i = 0; i < 3; i++) {
        let na = Number(a[i]);
        let nb = Number(b[i]);
        if (na > nb) return false;
        if (nb > na) return true;
        if (!isNaN(na) && isNaN(nb)) return false;
        if (isNaN(na) && !isNaN(nb)) return true;
    }
    return false;
}