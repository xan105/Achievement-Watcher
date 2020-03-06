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
As of 06/03/2019 | dd-mm-yyyy

- Arabic (ar) | العربية
- Bulgarian (bg) | български език
- Chinese: Simplified  (zh-CN) | 简体中文
    <br/>Complete <br/>
    No css override <br/>
    [fiyeck](https://github.com/fiyeck)
- Chinese: Traditional (zh-TW) | 繁體中文	
- Czech (cs) | čeština	
- Danish (da) | Dansk	
- Dutch (nl) | Nederlands	
- English (en) | English
    <br/>Complete <br/>
    No css override <br/>
    Anthony Beaumont
- Finnish (fi) | Suomi	
- French (fr) | Français
    <br/>Complete <br/>
    Css override <br/>
    Anthony Beaumont
- German (de) | Deutsch
    <br/>Incomplete <br/>
    No css override <br/>
    Anthony Beaumont, [Shanas377](https://github.com/Shanas377)
- Greek (el) | Ελληνικά	
- Hungarian (hu) | Magyar
    <br/>Complete <br/>
    Css override <br/>
    [Roschach96](https://github.com/Roschach96)
- Italian (it) | Italiano
    <br/>Incomplete <br/>
    Css override <br/>
    pollolollo9001
- Japanese (ja) | 日本語	
    <br/>Incomplete <br/>
    css override <br/>
    Steam UI + Google Translate	
- Korean (ko) | 한국어
- Norwegian (no) | Norsk	
- Polish (pl) | Polski
    <br/> Complete <br/>
    Css override <br/>
    [GrzybDev](https://github.com/GrzybDev)	
- Portuguese (pt) | Português	
- Portuguese: Brazil (pt-BR) | Português-Brasil	
- Romanian (ro) | Română	
- Russian (ru) | Русский	
    <br/>Incomplete <br/>
    Css override <br/>
    [hugmouse](https://github.com/hugmouse)
- Spanish (es) | Español-España
    <br/> Complete <br/>
    Css override <br/>
    [1024mb](https://github.com/1024mb)	
- Spanish: Latin America (es-419) | Español-Latinoamérica
    <br/> Complete <br/>
    Inherit css override from Spanish (es) <br/>
    [1024mb](https://github.com/1024mb)	
- Swedish (sv) | Svenska	
- Thai (th) | ไทย
    <br/>Incomplete <br/>
    No css override <br/>
    Anthony Beaumont
- Turkish (tr) | Türkçe
- Ukrainian (uk) | Українська	
- Vietnamese (vn) | Tiếng Việt
