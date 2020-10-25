About
=====

Windows toast notification using PowerShell or WinRT (Windows 8, 8.1, 10).<br />

Doesn't use any native module. Everything is done through PowerShell but you can use native WinRT API instead by **optionally** installing [NodeRT](https://github.com/NodeRT/NodeRT) relative package:
+ @nodert-win10-rs4/windows.data.xml.dom
+ @nodert-win10-rs4/windows.ui.notifications

Using NodeRT is a bit faster as you don't have to wait for the PowerShell VM to start and you'll be able to register to the onActivated/onDismissed callback.

Looking for Windows balloon notification ? [node-powerballoon](https://github.com/xan105/node-powerballoon) 

Example
=======
<p align="center">
<img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/example.png">
</p>

```js 
const toast = require('powertoast'); //CommonJS
//OR
import toast from 'powertoast'; //ES Module

//Sending a simple notification

toast({
  title: "NPM",
  message: "Installed.",
  icon: "https://static.npmjs.com/7a7ffabbd910fc60161bc04f2cee4160.png"
}).catch((err) => { 
  console.error(err);
});
```

Installation
============

`npm install powertoast`

### Optional packages

_Prequisites: VS2017 / Python 2.7(node-gyp) / Windows SDK 10.0.17134.0 (1803 Redstone 4)_

 + [NodeRT windows.data.xml.dom](https://www.npmjs.com/package/@nodert-win10-rs4/windows.data.xml.dom)<br />
 `npm install @nodert-win10-rs4/windows.data.xml.dom`
 + [NodeRT windows.ui.notifications](https://www.npmjs.com/package/@nodert-win10-rs4/windows.ui.notifications)<br /> 
 `npm install @nodert-win10-rs4/windows.ui.notifications`

Options
=======

⚠️ Windows 8/8.1 have very basic notification compared to Windows 10, some options will be ignored.<br />
Windows 7 and before don't have toast notification and thus will throw the error `Unsupported Windows version`.<br />

All options are optional.

- **disableWinRT** : boolean | Win10

  If you have installed the optional NodeRT native module but for whatever reason(s) you want to use PowerShell instead.
  Then set this to `true`

- **appID** : string | Win8,8.1,10

  Your [Application User Model ID](https://docs.microsoft.com/fr-fr/windows/desktop/shell/appids).
  
  **Default** to Microsoft Store so you can see how it works if not specified.
  
  ⚠️ An invalid appID will result in the notification not being displayed !

  You can view all installed appID via the powershell command :
  ```
  PS> Get-StartApps %search%
  ```

  ```js  
  const toast = require('powertoast');

  toast({
    appID: "Microsoft.XboxApp_8wekyb3d8bbwe!Microsoft.XboxApp", //Xbox App
    title: "Hello",
    message: "world"
  }).catch(err => console.error(err));

  ```

  ### If you are using this module with electron :
  In Electron, you can set it at runtime using the `app.setAppUserModelId()` method.
  
  Example with a dev electron app : (*Dont forget to add a non-pinned shortcut to your start menu in this case.*)

  <p align="center">
  <img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/electron.png">
  </p>

  ```js  
  const toast = require('powertoast');

  toast({
    appID: "D:\\dev\\hello_world\\node_modules\\electron\\dist\\electron.exe", //app.setAppUserModelId(process.execPath) 
    title: "Hello",
    message: "world"
  }).catch(err => console.error(err));

  ```

- **title** : string | Win8,8.1,10
  
  The title of your notification

- **message** : string | Win8,8.1,10

  The content message of your notification.
  You can use "\n" to create a new line for the forthcoming text.
  
  Since the Windows 10 Anniversary Update the default and maximum is up to 2 lines of text for the title, and up to 4 lines (combined) for the message.

- **attribution** : string | Win10 (>= Anniversary Update)

  Reference the source of your content. This text is always displayed at the bottom of your notification, along with your app's identity or the notification's timestamp.

  On older versions of Windows that don't support attribution text, the text will simply be displayed as another text element (assuming you don't already have the maximum of 3 text elements).
  
 <p align="center">
<img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/attribution.png">
</p>
  
  ```js
    
    const toast = require('powertoast');

    toast({
      appID: "com.squirrel.GitHubDesktop.GitHubDesktop",
      title: "Github",
      message: "Someone commented your issue",
      icon: "D:\\Desktop\\25231.png",
      attribution: "Via Web"
    }).catch(err => console.error(err));

  ```

- **icon** : string | Win8,8.1,10

  The URI of the image source, using one of these protocol handlers:
  
  - file:/// (*eg: `"D:\\Desktop\\test.jpg"`*)
  - http(s):// (only available when using a UWP appID)

  Icon dimensions are 48x48 pixels at 100% scaling.

  .png and .jpeg are supported.

  For http and https remote web images, there are limits on the file size of each individual image. <br/>
  3 MB on normal connections and 1 MB on metered connections. <br/>
  Before Fall Creators Update, images were always limited to 200 KB.<br/>

  If an image exceeds the file size, or fails to download, or times out, or is an unvalid format the image will be dropped and the rest of the notification will be displayed.

- **cropIcon** : boolean | Win10

  You can use this to 'circle-crop' your image (true). Otherwise, the image is square (false).
  
  **default** to false.

- **headerImg** : string | Win10 (>= Anniversary Update)

  <p align="center">
  <img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/header.png">
  </p>

  Display a prominently image within the toast banner and inside the Action Center if there is enough room. <br/>
  Image dimensions are 364x180 pixels at 100% scaling.
  If the image is too big it will be cut from the bottom.
  
  Otherwise same restriction as above.

- **footerImg** : string | Win10

  <p align="center">
  <img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/footer.png">
  </p>

  A full-width inline-image that appears at the bottom of the toast and inside the Action Center if there is enough room.
  Image will be resized to fit inside the toast.
  
  Otherwise same restriction as above.

- **silent** : boolean | Win8,8.1,10

  True to mute the sound; false to allow the toast notification sound to play. **Default** to false.

- **hide** : boolean | Win10
  
  True to suppress the popup message and places the toast notification **silently** into the action center. **Default** to false.<br/>
  Using `silent: true` is redundant in this case.
  
- **audio** : string | Win8,8.1,10

  The audio source to play when the toast is shown to the user.<br/>
  You **can't** use file:/// with this ! You are limited to the Windows sound schema available in your system.<br/>
  
  example: ms-winsoundevent:Notification.Default
  
  **Tip**: But you can create your own Windows sound schema with the registry and use it for your toast:
  
  File must be a .wav, by default Windows sounds are located in `%WINDIR%\media`
  
  ```
  //Registry
  Windows Registry Editor Version 5.00

  [HKEY_CURRENT_USER\AppEvents\Schemes\Apps\.Default\**YOUR_SOUND_ID**]

  [HKEY_CURRENT_USER\AppEvents\Schemes\Apps\.Default\**YOUR_SOUND_ID**\.Current]
  @="path_to_your_sound_file.wav"

  [HKEY_CURRENT_USER\AppEvents\Schemes\Apps\.Default\**YOUR_SOUND_ID**\.Default]
  @="path_to_your_sound_file.wav"
  
  //Js
  const toast = require('powertoast');

  toast({
    appID: "com.squirrel.GitHubDesktop.GitHubDesktop",
    title: "Github",
    message: "Someone commented your issue",
    audio: "ms-winsoundevent:**YOUR_SOUND_ID**"
  }).catch(err => console.error(err));
  ```
  
- **longTime** : boolean | Win10

  Increase the time the toast should show up for.<br />
  **Default** to false.
  
  Most of the time "short" (default) is the most appropriate, and Microsoft recommends not using "long".<br />
  This is only here for specific scenarios and app compatibility (Windows 8).
  
  Long is around ~ 25sec<br />
  Short is the user defined value (_Windows settings > Ease of Access > Display > Show notification for ..._)
  
  Or registry: `HKCU\Control Panel\Accessibility` -> `MessageDuration`::DWORD (Not recommended to directly modify registry value)
  
  User value default to 5sec; <br/>
  Available: 5, 7, 15, 30, 1min, 5min

- **onClick** : string | Win10

  Protocol to launch when the user click on the toast.<br />
  If none (**default**) click will just dismiss the notification.<br />

  ⚠️ Only protocol type action is supported as there's no way of receiving feedback from the user's choice via PowerShell.<br />
  If you are using NodeRT native module and you want to execute some js code when the user click on the toast or when the toast is dismissed then please see the callback option section down below.<br />
  
  Example of protocol type action button to open up Windows 10's maps app with a pre-populated search field set to "sushi":
  
  ```js
  const toast = require('powertoast');

  toast({
    message: "Sushi",
    onClick: "bingmaps:?q=sushi"
  }).catch(err => console.error(err));
  ```

  You can also redirect to an http/https resource :
  
   ```js
  const toast = require('powertoast');

  toast({
    message: "Google It",
    onClick: "https://www.google.com"
  }).catch(err => console.error(err));
  ```

  **Tip**: You can create your own protocol: [create your own URI scheme](https://msdn.microsoft.com/en-us/windows/desktop/aa767914).<br/>
  And even send args back to your electron app:<br/>
  In electron just make your app a single instance with `app.requestSingleInstanceLock()`<br/>
  Then use the second-instance event to parse the new args.
  
  Let's say we created an electron: URI scheme;
  Let's send a notification:
  ```js
  toast({
    message: "custom URI",
    onClick: "electron:helloworld"
  }).catch(err => console.error(err));
  ```
  In electron:
  ```js
  if (app.requestSingleInstanceLock() !== true) { app.quit(); }
  app.on('second-instance', (event, argv, cwd) => {  
    
    console.log(argv);
    //[...,"electron:helloworld"]

  }) 
  ```

- **button** : [{ text : string, onClick : string, contextMenu ?: boolean, icon ?: string }] | Win10 (contextMenu >= Anniversary Update)

  Array of buttons to add to your toast. You can only have up to 5 buttons. <br/>
  After the 5th they will be ignored.
  
  ```js
  [
    {
      text: "", 
      onClick: "", //Protocol to launch (see previous onClick section)
      icon: "", //Optional icon path
      contextMenu: true //Optional placement to context menu (Anniversary Update)
    },
    ...
  ]
  ```
  
<p align="center">
<img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/button.png">
</p>
  
 ```js
  
const toast = require('powertoast');

toast({
  title: "Browser",
  message: "Choose your favorite",
  button: [
    {text: "Firefox", onClick:"https://www.mozilla.org/en/firefox/new/"},
    {text: "Chrome", onClick:"https://www.google.com/chrome/"}
  ]
}).catch(err => console.error(err));

  ```
  
  You can add icons to your buttons.<br />
  These icons are white transparent 16x16 pixel images at 100% scaling, and should have no padding included in the image itself.<br />
  In order to transforms the style of your buttons into icon buttons you have to provide icons for **ALL** of your buttons in the notification.
  
<p align="center">
<img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/btn-icon.png">
</p>
  
  You can add additional context menu actions to the existing context menu that appears when the user right clicks your toast from within Action Center by using `contextMenu: true`.<br />
This menu only appears when right clicked from Action Center. It does not appear when right clicking a toast popup banner.
Anniversary Update and up, on older version these additional context menu actions will simply appear as normal buttons on your toast.
Additional context menu items contribute to the total limit of 5 buttons on a toast.

- **callback** : { keepalive ?: number, onActivated?() : void, onDismissed?() : void } | Win10 (⚠️ WinRT only) 

  Callback to execute when user activates a toast notification through a click or when a toast notification leaves the screen, either by expiring or being explicitly dismissed by the user.<br />
  
  Because of how [NodeRT](https://github.com/NodeRT/NodeRT) works registered event listener does not keep the event loop alive so you will need to provide a timeout value to keep it alive (default to 5sec as it is the default notification duration but keep in mind some users might have change this value in their Windows settings).<br />
  
  The promise will resolve as soon as possible and will not wait for the keep-a-live. The keep-a-live is only to permit WinRT events to register.<br />
  
  ```js
  const toast = require('powertoast');

  toast({
    title: "Hello",
    message: "world",
    callback: { 
      timeout: 5000, //keep-a-live in ms
      onActivated: ()=>{ console.log("activated") },
      onDismissed: (reason)=>{ console.log(reason) }
  })
  .then(()=> console.log("Notified")
  .catch(err => console.error(err));
  ```
  
  `onDismissed` gives you an optional reason:
    + userCanceled (0)
    + applicationHidden (2)
    + timeout (when the keep-a-live has been reached)
    
    In the case the reason is none of the above then the value will be the reason integer code. You are welcome to tell me any reason code I'm un-aware of.
  
- **scenario** : string | Win10

  "default", "alarm", "reminder", "incomingCall"<br />
  **Default** to ... well, 'default'.

  The scenario adjusts a few behaviors:

  + **Reminder**: The notification will stay on screen until the user dismisses it or takes action (Sticky notification).
    _Microsoft doesn't recommend to use this just for keeping your notification persistent on screen_.
  + **Alarm**: In addition to the reminder behaviors, alarms will additionally loop audio with a default alarm sound.
  + **IncomingCall**: Same behaviors as alarms except they use ringtone audio and their buttons are styled differently (displayed full screen on Windows Mobile devices).
  <br />
  When using Reminder or Alarm, you must provide at least one button on your toast notification.<br /> 
  Otherwise, the toast will be treated as a normal toast.
  
- **progress** : { header ?: string, percent ?: number | null, custom ?: string, footer ?: string } | Win10 (>= Creators Update)

  Add a progress bar to your toast.<br/>
  ```
  {
    header : optional string,
    footer: optional string,
    percent : percent of the progress bar, set it to null or omit it to get a progress with the little dots moving,
    custom : optional string to be displayed instead of the default percentage string
  }
  ```
  
<p align="center">
<img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/progress.png">
</p>
  
  ```js
  
const toast = require('powertoast');

toast({
  title: "Dummy",
  message: "Hello World",
  icon: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/480/winner.jpg",
  progress:{
    header: "Header",
    footer: "Footer",
    percent: 50,
    custom: "10/20 Beers"
  }
}).catch(err => console.error(err));
  
  ```
  
- **uniqueID** : string | Win10

   You can replace a notification by sending a new toast with the same uniqueID. <br/>
   This is useful when using a progress bar or correcting/updating the information on a toast. <br/>
   And you don't want to end up with a flood of similar toasts in the Action Center. <br/> 
   
   However this is not really suitable for information that frequently changes in a short period of time (like a download progress for example)
   or subtle changes to your toast content, like changing 50% to 65%.

- **sequenceNumber** : number | Win10

    Provide sequence number to prevent out-of-order updates, or assign 0 to indicate "always update". <br/>
    A higher sequence number indicates a newer toast. <br/>
    _default to 0_ <br/>
    
    The sequence number may helps to ensure that toasts will not be displayed in a manner that may confuse when updating/correcting.
  
- **group** : { id : string, title : string } | Win10 (>= Creators Update)

    You can group notifications under a common header within Action Center<br/>
    ```
  {
    id: use the same header id string to unify them under the header,
    title: title of the header, title can be different and will be shown above the toast.
           title from the most recent notification within a group is used in Action Center, 
           if that notification gets removed, then the title falls back 
           to the next most recent notification. 
  }
  ```
  
<p align="center">
<img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/group.png">
</p>
  
- **timeStamp** : number | string

  Unix epoch time in seconds.<br/>
  Current time by **default** if not specified.<br/>
  
  By default, the timestamp visible within Action Center is set to the time that the notification was sent.<br/>
  You can optionally override the timestamp with your own custom date and time, so that the timestamp represents the time the message/information/content was actually created, rather than the time that the notification was sent.<br/>
  This also ensures that your notifications appear in the correct order within Action Center (which are sorted by time). Microsoft recommends that most apps specify a custom timestamp.<br/>
  But you can safely omit this option.

Microsoft doc
=============

📖 [Microsoft Toast API](https://docs.microsoft.com/en-us/windows/uwp/design/shell/tiles-and-notifications/adaptive-interactive-toasts).<br />
📖 [Toast content XML schema](https://docs.microsoft.com/en-us/windows/uwp/design/shell/tiles-and-notifications/toast-xml-schema).

Common Issues
=============

- I dont see any notification

  1. Check your appID.
  2. Check your focus assistant and notifcation settings. Don't forget 'Quiet hours' on Windows 8.1
  3. In some cases you need a shortcut (win8) or a non-pinned shortcut (win10) to your start menu for the specified appID.
  
- Where is my icon/image ?

  Check URL or file path.<br/>
  URL is only available for UWP appID.<br/>
  If an image exceeds the file size, or fails to download, or times out, or is an unvalid format the image will be dropped and the rest of the notification will be displayed.<br/>
  A workaround is to download yourself the image and pass the img filepath instead of an URL.
  
- Notifications when app is fullscreen aren't displayed
  
  You can't drawn a notification over an exclusive fullscreen app.<br />
  But you can over a fullscreen borderless.<br />
  
  Double check your focus assistant and notifcation settings in the windows settings panel.<br />
  Note that since Windows 10 1903 there is a new default fullscreen auto rule enabled to alarm only by default which will prevent toast notification over fullscreen borderless.

- Slight delay between event and the display of the notification

  Running the PowerShell script can take a few seconds in some cases.<br />
  If it really bothers you, you might want to try to use the optional NodeRT native module.<br />
  If you are loading a remote img resource via http/https it can significantly impact the delay if it hasn't been cached yet by Windows.

- Notification don't stay in the Action center

  When using a Win32 appID notification will remove itself from the Action center when the app gets focus.<br/>
  Use a UWP appID instead.
  
Known missing features
======================

  + Expiration time
  + Adaptative progress bar update
