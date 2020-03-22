"use strict"

const { spawn } = require("child_process");

module.exports = (option = {}) => {
    return new Promise((resolve, reject) => {
    
        const options = {
          ignoreSystemDrive : option.ignoreSystemDrive || false
        }
        
        const cmd = spawn('cmd');
        let error = []; 
        
        cmd.stdout.on('data', function (data) {
            const output = String(data).split("\r\n").map(e=>e.trim()).filter(e=>e!="");
            if (output[0] === "Name") resolve(output.slice(1));
        });

        cmd.stderr.on('data', function (data) {
            error.push(data);
        });

        cmd.on('exit', function (code) {
            if (code !== 0){
                if (error.length > 0) {
                  reject(code + " " + error.join());
                } else {
                  reject(code);
                }
            }
        });
        
        //WMIC LogicalDisk Where "DeviceID !='C:'" Get DeviceID, FreeSpace, Size, VolumeName 2>Nul
        if (options.ignoreSystemDrive) {
          cmd.stdin.write(`WMIC LogicalDisk Where "DeviceID !='%SystemDrive%' And DriveType ='3'" Get Name\n`);
        } else {
          cmd.stdin.write(`WMIC LogicalDisk Where "DriveType ='3'" Get Name\n`);
        }
        cmd.stdin.end();
    })
}