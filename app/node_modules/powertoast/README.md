Windows toast notifications using PowerShell.<br />
✔️ No native module.<br />
✔️ Promise.<br />

Inspired by go-toast https://github.com/go-toast/toast

Example
=======
<p align="center">
<img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/example.png">
</p>

```js 
const toast = require('powertoast');

toast({
  title: "NPM"
  message: "Installed.",
  icon: "https://static.npmjs.com/7a7ffabbd910fc60161bc04f2cee4160.png"
}).catch((err) => { 
  console.error(err);
});
```

Older Windows limitation
======================== 

Windows 7 and before don't have toast notification.<br />
Windows 8/8.1 have very basic notification compared to Windows 10, some options will be ignored.

Options
=======

- **appID**

  Your [Application User Model ID](https://docs.microsoft.com/fr-fr/windows/desktop/shell/appids).
  
  ⚠️ An invalid appID will result in the notification not being displayed !
  
  In Electron, you can set it at runtime using the `app.setAppUserModelId()` method.
  
  You can view all installed appid via powershell command :
  ```
  PS> Get-StartApps %search%
  ```
  
  **Default** to Microsoft Store so you can see how it works if not specified.
  
  Example with a dev electron app (*Dont forget to add a non-pinned shortcut to your start menu.*)

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

  The content message of your notification

- **attribution** *//Anniversary Update*

  Reference the source of your content. This text is always displayed at the bottom of your notification, along with your app's identity or the notification's timestamp.

  On older versions of Windows that don't support attribution text, the text will simply be displayed as another text element (assuming you don't already have the maximum of three text elements).
  
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

1. UWP :
- http:// or https://
- ms-appx:///
- ms-appdata:///local/

2. Win32 :
- file:/// (*eg: `"D:\\Desktop\\test.jpg"`*)

The Icon should be an absolute path to the icon (as the toast is invoked from a temporary path on the user's system, not the working directory).

Icon dimensions are 48x48 pixels at 100% scaling.

.png and .jpeg 

For http and https remote web images, there are limits on the file size of each individual image. <br/>
3 MB on normal connections and 1 MB on metered connections. <br/>
Before Fall Creators Update, images were always limited to 200 KB.<br/>

If an image exceeds the file size, or fails to download, or times out, or is an unvalid format the image will be dropped and the rest of the notification will be displayed.

- **headerImg** *//Anniversary Update*

<p align="center">
<img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/header.png">
</p>

  Display a prominently image within the toast banner and while inside the Action Center. <br/>
  Image dimensions are 364x180 pixels at 100% scaling.
  
  Otherwise same restriction as above.

- **footerImg** *(inline-image)*

<p align="center">
<img src="https://github.com/xan105/node-powertoast/raw/master/screenshot/footer.png">
</p>

  A full-width inline-image that appears at the bottom of the toast.
  Image will be resized to fit inside the toast.
  
  Otherwise same restriction as above.

- **silent**

  True to mute the sound; false to allow the toast notification sound to play.
  **Default** to false.

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

  **Tip**: To send args back to your electron app just [create your own URI scheme](https://msdn.microsoft.com/en-us/windows/desktop/aa767914).<br/>
  Then in electron make your app a single instance with `app.requestSingleInstanceLock()`<br/>
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

  Array of buttons to add to your toast.
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
