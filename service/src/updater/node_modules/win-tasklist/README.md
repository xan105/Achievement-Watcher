Dependency-free promise based wrapper for the Windows tasklist command.

Note about locale:
------------------

Most Windows commands change their output based on system's locale, which can be sometimes difficult when you are trying to parse the output on a non-English system.
This module tries to be system-locale-independent as much as possible in order to be able to parse the tasklist output.
Unfortunately user and windowTitle returned properties will remain locale-dependent (Not sure about sessionType ?).

Install & Usage example
-----------------------

```$ npm install win-tasklist```

Get a specific process information :

```js
const tasklist = require('win-tasklist');

tasklist.getProcessInfo("explorer.exe",{verbose: true}).then((process)=>{

  console.log(process);
  
  /* OUTPUT
  [ { process: 'explorer.exe',
      pid: 6960,
      sessionType: 'console',
      sessionNumber: 1,
      memUsage: 169783296,
      state: 'running',
      user: 'skynet\\xan',
      cpuTime: '0:02:15',
      windowTitle: 'n/a' } ]  
  */


}).catch((err)=>{
  console.error(err);
});
```

List them all :

```js
const tasklist = require('win-tasklist');

tasklist().then((list)=>{

  console.log(list);
  
  /* OUTPUT
  [ { process: 'system idle process',
      pid: 0,
      sessionType: 'services',
      sessionNumber: 0,
      memUsage: 8192 },
    { process: 'system',
      pid: 4,
      sessionType: 'services',
      sessionNumber: 0,
      memUsage: 2580480 }, 
      ... 100 more items ]
  */


}).catch((err)=>{
  console.error(err);
});
```

API
---

It's always good to have a look at the official [tasklist](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/tasklist) doc.

**tasklist**([option])

Promise.<br />
Returns an [Array] of object or null<br />

**options**
    
- verbose (default: false)<br />
      if false will return the following properties : process, pid, sessionType, sessionNumber, memUsage (bytes).<br />
      if true will additionally return the following properties : state, user, cpuTime, windowTitle.<br />
      <br />
      Keep in mind using the verbose option might impact performance.
    
- remote (default: null)<br />
      Name or IP address of a remote computer.<br />
      Must be used with user and password options below.
    
- user (default: null)<br />
      Username or Domain\Username.
    
- password (default: null)<br />
      User's password.
      
- filter (default: [])<br />
    
     Array of string. Each string being a filter.<br />
     
     eg filter for listing only running processes :
     ```
     ["STATUS eq RUNNING"]
     ```
     
     From the tasklist doc :
    
     <table>
        <thead>
        <tr>
        <th>Filter Name</th>
        <th>Valid Operators</th>
        <th>Valid Values</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td>STATUS</td>
        <td>eq, ne</td>
        <td>RUNNING</td>
        </tr>
        <tr>
        <td>IMAGENAME</td>
        <td>eq, ne</td>
        <td>Image name</td>
        </tr>
        <tr>
        <td>PID</td>
        <td>eq, ne, gt, lt, ge, le</td>
        <td>PID value</td>
        </tr>
        <tr>
        <td>SESSION</td>
        <td>eq, ne, gt, lt, ge, le</td>
        <td>Session number</td>
        </tr>
        <tr>
        <td>SESSIONNAME</td>
        <td>eq, ne</td>
        <td>Session name</td>
        </tr>
        <tr>
        <td>CPUTIME</td>
        <td>eq, ne, gt, lt, ge, le</td>
        <td>CPU time in the format <em>HH</em><strong>:</strong><em>MM</em><strong>:</strong><em>SS</em>, where <em>MM</em> and <em>SS</em> are between 0 and 59 and <em>HH</em> is any unsigned number</td>
        </tr>
        <tr>
        <td>MEMUSAGE</td>
        <td>eq, ne, gt, lt, ge, le</td>
        <td>Memory usage in KB</td>
        </tr>
        <tr>
        <td>USERNAME</td>
        <td>eq, ne</td>
        <td>Any valid user name</td>
        </tr>
        <tr>
        <td>SERVICES</td>
        <td>eq, ne</td>
        <td>Service name</td>
        </tr>
        <tr>
        <td>WINDOWTITLE</td>
        <td>eq, ne</td>
        <td>Window title</td>
        </tr>
        <tr>
        <td>MODULES</td>
        <td>eq, ne</td>
        <td>DLL name</td>
        </tr>
        </tbody>
    </table>

Helper function:
================

- **getProcessInfo**(process,[option])

  Promise.<br />

  `process` can either be a PID or an imagename.<br />
  Same option as main function minus filter.<br />

  Returns an [Array] of object or null<br />

- **isProcessRunning**(process,[option])

  Promise.<br />
  
  `process` can either be a PID or an imagename.<br />
  Same options as main function minus filter and verbose.<br />
  
  Return true if the specified process is running (*meaning it has the status RUNNING*),<br />
  false otherwise.<br />
   
  Equivalent of filter *IMAGENAME/PID eq %process% and STATUS eq RUNNING*.<br />
   
- **hasProcess**(process,[option])

  Promise.<br />
  
  `process` can either be a PID or an imagename.<br />
  Same options as main function minus filter and verbose.<br />
  
  Return true if the specified process is loaded (*meaning it is listed in the tasklist*),<br />
  false otherwise.<br />
  
  Equivalent of filter *IMAGENAME/PID eq %process%*.<br />
