export function unescape(string) {

  if (typeof(string) !== "string") throw "ENOTASTRING";
  if (!string) throw "EUNEXPECTEDEMPTYSTRING";

  const char_ref = {
    "&amp;" : '\u0026', //& (ampersand)
    "&lt;" : '\u003C', //< (less-than sign)
    "&gt;" : '\u003E', //> (greater-than sign)
    "&quot;" : '\u0022', //" (quotation mark)
    "&apos;" : '\u0027' //' (apostrophe)
  };
  
  for (let x in char_ref) string = string.replace(new RegExp(x, 'g'),char_ref[x]); //replace all
  
  return string;

}