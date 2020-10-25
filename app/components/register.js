const { ipcRenderer } = require("electron");

import titleBar from './titleBar/titleBar.js';
import userAvatar from './userAvatar/index.js';

customElements.define('title-bar', titleBar);
customElements.define('user-avatar', userAvatar);

ipcRenderer.invoke('components-loaded');