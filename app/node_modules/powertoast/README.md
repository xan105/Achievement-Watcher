Windows toast notification using PowerShell for NodeJS.<br />
✔️ No native module.<br />
✔️ Promise.<br />

Inspired by go-toast https://github.com/go-toast/toast

Windows limitation
===================

Windows 8/8.1 have very basic notification compared to Windows 10, some options will be ignored.<br />
Windows 7 and before don't have toast notification and thus will throw the error "Unsupported Windows version".<br />

Example
=======
<p align="center">
<img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/example.png">
</p>

```js 
//Sending a simple notification
const toast = require('powertoast');

toast({
  title: "NPM"
  message: "Installed.",
  icon: "https://static.npmjs.com/7a7ffabbd910fc60161bc04f2cee4160.png"
}).catch((err) => { 
  console.error(err);
});
```

Options
=======

- **appID**

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

- **title**
  
  The title of your notification

- **message**

  The content message of your notification.
  You can use "\n" to create a new line for the forthcoming text.
  
  Since the Windows 10 Anniversary Update the default and maximum is up to 2 lines of text for the title, and up to 4 lines (combined) for the message.

- **attribution** *//Windows 10 Anniversary Update*

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

- **icon**

The URI of the image source, using one of these protocol handlers:

1. If you are using a UWP appID you can use:
- http:// or https://
- ms-appx:///
- ms-appdata:///local/

2. If you are using a Win32 appID you can use:
- file:/// (*eg: `"D:\\Desktop\\test.jpg"`*)

The Icon should be an absolute path to the icon (as the toast is invoked from a temporary path on the user's system, not the working directory).

Icon dimensions are 48x48 pixels at 100% scaling.

.png and .jpeg are supported.

For http and https remote web images, there are limits on the file size of each individual image. <br/>
3 MB on normal connections and 1 MB on metered connections. <br/>
Before Fall Creators Update, images were always limited to 200 KB.<br/>

If an image exceeds the file size, or fails to download, or times out, or is an unvalid format the image will be dropped and the rest of the notification will be displayed.

- **headerImg** *//Anniversary Update*

<p align="center">
<img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/header.png">
</p>

  Display a prominently image within the toast banner and inside the Action Center if there is enough room. <br/>
  Image dimensions are 364x180 pixels at 100% scaling.
  If the image is too big it will be cut from the bottom.
  
  Otherwise same restriction as above.

- **footerImg** *(inline-image)*

<p align="center">
<img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/footer.png">
</p>

  A full-width inline-image that appears at the bottom of the toast and inside the Action Center if there is enough room.
  Image will be resized to fit inside the toast.
  
  Otherwise same restriction as above.

- **silent**

  True to mute the sound; false to allow the toast notification sound to play. **Default** to false.
  
- **audio**

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
  
- **longTime**

  Increase the time the toast should show up for.
  **Default** to false.
  
  Most of the time "short" is the most appropriate, and Microsoft recommends not using "long", but it can be useful for important dialog.

- **onClick**

  Protocol to launch when the user click on the toast.<br />
  If none (**default**) click will just dismiss the notification.<br />

  Only protocol type action buttons are supported as there's no way of receiving feedback from the user's choice.
  
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

- **button**

  Array of buttons to add to your toast. You can only have up to 5 buttons. <br/>
  After the 5th they will be ignored.
  
  ```
  [{text: "", onClick: ""}, ...]
  ```
  
<p align="center">
<img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/button.png">
</p>
  
 ```js
  
const toast = require('powertoast');

toast({
  title: "Browser",
  message: "Choose your favorite",
  buttons: [{text: "Firefox", onClick:"https://www.mozilla.org/en/firefox/new/"},{text: "Chrome", onClick:"https://www.google.com/chrome/"}]
}).catch(err => console.error(err));

  ```
  
- **progress**  

  Add a progress bar to your toast.<br/>
  ```
  {
    header : optional string,
    footer: optional string,
    percent : percent of the progress bar, default to zero if not specified,
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
  
  
- **timeStamp**

  Unix epoch time in seconds.<br/>
  Current time by **default** if not specified.<br/>
  
  By default, the timestamp visible within Action Center is set to the time that the notification was sent.<br/>
  You can optionally override the timestamp with your own custom date and time, so that the timestamp represents the time the message/information/content was actually created, rather than the time that the notification was sent.<br/>
  This also ensures that your notifications appear in the correct order within Action Center (which are sorted by time). Microsoft recommends that most apps specify a custom timestamp.<br/>
  But you can safely omit this option.

<hr/>

See https://docs.microsoft.com/en-us/windows/uwp/design/shell/tiles-and-notifications/adaptive-interactive-toasts for more information.

Common Issues
=============

- I dont see any notification

  1. Check your appID.
  2. Check your focus assistant and notifcation settings. Don't forget 'Quiet hours' on Windows 8.1
  3. In some cases you need a shortcut (win8) or a non-pinned shortcut (win10) to your start menu for the specified appID.
  
- Where is my icon/image ?

  Check url or path (should be an absolute path as the toast is invoked from a temporary path on the user's system, not the working directory).<br />
  If an image exceeds the file size, or fails to download, or times out, or is an unvalid format the image will be dropped and the rest of the notification will be displayed.
  
- Notifications when app is fullscreen aren't displayed
  
  You can't drawn a notification over an exclusive fullscreen app.<br />
  But you can over a fullscreen borderless.<br />
  
  Double check your focus assistant and notifcation settings in the windows settings panel.<br />
  Note that since Windows 10 1903 there is a new default fullscreen auto rule enabled to alarm only by default which will prevent toast notification over fullscreen borderless.

- Slight delay between event and the display of the notification

  Running the PowerShell script can take a few seconds in some cases.<br />
  If you are loading remote img resource via http/https it can significantly impact the delay if it hasn't been cached yet.

- Notification don't stay in the Action center

  A Win32 appID -> notification will remove itself from the Action center when the app gets focus.<br/>
  A UWP one will not.
