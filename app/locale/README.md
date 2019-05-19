Default back to English if your language is not there, missing elements will also default back to English if any.
Fetching data from Steam will use your specified language, if the game doesn't support it Steam will respond with English data.

Nb: the Steam web API Key disclaimer in the Settings section is never translated.

Translation Help
================

I do my best to translate everything for every supported language by Steam, but it's rather difficult and I don't speak that much languages.
Fluent in another language ? Any help to add/modify/improve would be greatly appreciated.

Please use the `lang/english.json` as template (others might have missing elements).
Translate the values on the right side.

If some UI changes are needed you can css override in `override.css` by using:
```css
  html[lang=xx] .selector{/*modification*/}
```

Available/Supported langs (based on [steam](https://partner.steamgames.com/doc/store/localization)) are stored in `steam.json`.

Translation Status
==================
As of 18/03/2019

- Arabic (ar) | العربية
- Bulgarian (bg) | български език
- Chinese: Simplified  (zh-CN) | 简体中文
    <br/>Incomplete <br/>
    No css override <br/>
    Steam UI + Google Translate   
- Chinese: Traditional (zh-TW) | 繁體中文	
- Czech (cs) | čeština	
- Danish (da) | Dansk	
- Dutch (nl) | Nederlands	
- English (en) | English
    <br/>Complete <br/>
    No css override <br/>
    By Anthony Beaumont
- Finnish (fi) | Suomi	
- French (fr) | Français
    <br/>Complete <br/>
    No css override <br/>
    By Anthony Beaumont
- German (de) | Deutsch
    <br/>Complete <br/>
    No css override <br/>
    By Anthony Beaumont
- Greek (el) | Ελληνικά	
- Hungarian (hu) | Magyar
- Italian (it) | Italiano
    <br/>Complete <br/>
    css override <br/>
    By pollolollo9001
- Japanese (ja) | 日本語	
    <br/>Incomplete <br/>
    css override <br/>
    Steam UI + Google Translate	
- Korean (ko) | 한국어
- Norwegian (no) | Norsk	
- Polish (pl) | Polski	
- Portuguese (pt) | Português	
- Portuguese: Brazil (pt-BR) | Português-Brasil	
- Romanian (ro) | Română	
- Russian (ru) | Русский	
    <br/>Incomplete <br/>
    No css override <br/>
    Steam UI + Google Translate
- Spanish (es) | Español-España
    <br/>Incomplete <br/>
    css override <br/>
    Steam UI + Google Translate	
- Spanish: Latin America (es-419) | Español-Latinoamérica
    <br/>Inherit css override from Spanish (es) <br/>
- Swedish (sv) | Svenska	
- Thai (th) | ไทย
    <br/>Complete <br/>
    No css override <br/>
    By Anthony Beaumont
- Turkish (tr) | Türkçe
- Ukrainian (uk) | Українська	
- Vietnamese (vn) | Tiếng Việt
