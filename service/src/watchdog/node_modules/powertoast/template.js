'use-strict';

module.exports = (options) => {

  let template = `<toast ${(options.timeStamp) ? `displayTimestamp="${options.timeStamp}" `:``}activationType="protocol" launch="${options.onClick}" duration="${options.longTime ? "Long" : "Short"}">`;
  
  if (options.group && options.group.id && options.group.title) template += `<header id="${options.group.id}" title="${options.group.title}" arguments="" />`;
  
  template += `<visual><binding template="ToastGeneric">` + 
              `<image placement="appLogoOverride" src="${options.icon}" />` + 
              `<image placement="hero" src="${options.headerImg}"/>` +
              `<text><![CDATA[${options.title}]]></text>` +
              `<text><![CDATA[${options.message}]]></text>` +
              `<text placement="attribution"><![CDATA[${options.attribution}]]></text>`+
              `<image src="${options.footerImg}" />`;
              
  if (options.progress) template += `<progress title="${options.progress.header}" value="${options.progress.percent}" valueStringOverride="${options.progress.custom}" status="${options.progress.footer}"/>`;
  
  template += `</binding></visual><actions>`;
                       
  try {    
    for (let i in options.button) {
         if ( i <= 4) { //You can only have up to 5 buttons; Ignoring after max button count reached 
            if (options.button[i].text && options.button[i].onClick) {
                 template += `<action content="${options.button[i].text}" arguments="${options.button[i].onClick}" activationType="protocol"/>`;
            } 
        }
    }
  }catch(err){/*do nothing*/}  
        
  template += `</actions><audio silent="${options.silent}" ${(options.audio) ? `src="${options.audio}"` : ""}/></toast>`;

  return template;

}

module.exports.legacy = (options) => {

  if (options.progress && !options.message) options.message = `[ ${(options.progress.custom) ? options.progress.custom : `${options.progress.percent*100}/100`} ]\n${options.progress.header}`;

  let template = `<toast><visual><binding template="ToastImageAndText02">` +
                 `<image id="1" src="${options.icon}" alt="image1"/>` +
                 `<text id="1">${options.title}</text>` +
                 `<text id="2">${options.message}</text>` + 
                 `</binding></visual><audio silent="${options.silent}" ${(options.audio) ? `src="${options.audio}"` : ""}/></toast>`;

  return template;

}

