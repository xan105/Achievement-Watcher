/*
MIT License

Copyright (c) 2019-2020 Anthony Beaumont

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
'use strict';

const { imgResolve } = require("./helper.cjs");

module.exports = (options) => {

  let template = `<toast ${(options.timeStamp) ? `displayTimestamp="${options.timeStamp}" `:``}activationType="protocol" scenario="${options.scenario}" launch="${options.onClick}" duration="${options.longTime ? "Long" : "Short"}">`;
  
  if (options.group && options.group.id && options.group.title) template += `<header id="${options.group.id}" title="${options.group.title}" arguments="" />`;
  
  template += `<visual><binding template="ToastGeneric">` + 
              `<image placement="appLogoOverride" src="${imgResolve(options.icon)}" hint-crop="${options.cropIcon ? "circle" : "none"}"/>` + 
              `<image placement="hero" src="${imgResolve(options.headerImg)}"/>` +
              `<text><![CDATA[${options.title}]]></text>` +
              `<text><![CDATA[${options.message}]]></text>` +
              `<text placement="attribution"><![CDATA[${options.attribution}]]></text>`+
              `<image src="${imgResolve(options.footerImg)}" />`;
              
  if (options.progress) template += `<progress title="${options.progress.header}" value="${options.progress.percent}" valueStringOverride="${options.progress.custom}" status="${options.progress.footer}"/>`;
  
  template += `</binding></visual><actions>`;
                       
  try {    
    for (let i in options.button) {
         if ( i <= 4) { //You can only have up to 5 buttons; Ignoring after max button count reached 
            if (options.button[i].text && options.button[i].onClick) {
                template +=  `<action content="${options.button[i].text}" placement="${(options.button[i].contextMenu === true) ? 'contextMenu' : ''}" imageUri="${imgResolve(options.button[i].icon)}" arguments="${options.button[i].onClick}" activationType="protocol"/>`;
            } 
        }
    }
  }catch(err){/*do nothing*/}  
        
  template += `</actions><audio silent="${options.silent}" ${(options.audio) ? `src="${options.audio}"` : ""}/></toast>`;

  return template;

}

module.exports.legacy = (options) => {

  if (options.progress && !options.message && (options.progress.percent || options.progress.percent === 0) && options.progress.percent >= 0 && options.progress.percent <= 100 && options.progress.percent !== "indeterminate") {
    options.message = `[ ${(options.progress.custom) ? options.progress.custom : `${options.progress.percent}/100`} ]\n${options.progress.header}`;
  }

  let template = `<toast><visual><binding template="ToastImageAndText02">` +
                 `<image id="1" src="${imgResolve(options.icon)}" alt="image1"/>` +
                 `<text id="1">${options.title}</text>` +
                 `<text id="2">${options.message}</text>` + 
                 `</binding></visual><audio silent="${options.silent}" ${(options.audio) ? `src="${options.audio}"` : ""}/></toast>`;

  return template;

}