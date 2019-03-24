Extracts image files from an *.accountpicture-ms* file.<br/>

Promise will return an object containing a buffer for each file.<br/>
You can then save the buffer to a file or convert it to base64.<br/>

.accountpicture-ms file
=======================
Located in `%appdata%/Microsoft/Windows/AccountPictures` (Windows 8, 8.1, 10).

There are 2 JPEG files embedded within this file:

- a 'small' one with a resolution of 96*96 
- and a 'big' one with a squarred aspect-ratio of the original resolution of the file you used for your account picture.  

Both files have a JPEG and JFIF header.

NB: There can be more than one *.accountpicture-ms* file within the folder.

<hr />

**Update:**
There is now a new .accountpicture-ms file with 2 PNG files embedded.
  - 'small' 96*96 
  - 'big' original file **upscaled** to 448*448

This module will now try to extract png files first then fallback to jpg if it failed.  

Installing
==========
NPM: <br/>
`$ npm i accountpicture-ms-extractor`

Usage
=====
Promise returns an object
```js
{
  small : Buffer,
  big : Buffer,
  type: String // "png" or "jpeg"
}
```
Extracts image files (small and big) from specified *.accountpicture-ms* file.
```js
const accountms = require('accountpicture-ms-extractor');
accountms(filePath)
  .then((extracted) => {
     /*
     extracted = {small: Buffer, big: Buffer, type: String};
     
     Do something with extracted files : extracted.small & extracted.big
     
     */
  })
  .catch((err) => {
     console.error(err);
  });
```

Example
=======

```js
const fs = require('fs');
const accountms = require('accountpicture-ms-extractor');

accountms(file)
      .then((extracted) => {
      
        //write to file
        fs.writeFile(`small.${type}`,extracted.small,(err) => {
          if (err) throw err;  
        });
        fs.writeFile(`big.${type}`,extracted.big,(err) => {
          if (err) throw err;  
        });
        
        //as data64
        let html = `
          <img src="data:image/${type};charset=utf-8;base64,${extracted.small.toString('base64')}" alt="Lowres 96*96" />
          <img src="data:image/${type};charset=utf-8;base64,${extracted.big.toString('base64')}" alt="Highres" />`;
        
        fs.writeFile("data64.html",html,'utf8',(err) => {
          if (err) throw err;  
        });
        
      })
      .catch((err) => {
        console.error(err);
      });
```
