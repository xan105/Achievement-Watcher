'use strict';

import { template } from "./template.js"

const { getAvatar } = require("../components/userAvatar/avatar.js");
const { selectFileDialog } = require("../components/userAvatar/selectFileDialog.js");
const { contextMenu } = require("../components/userAvatar/contextMenu.js");

export default class titleBar extends HTMLElement {
    constructor() {
		super();

		this.attachShadow({mode: 'open'}).innerHTML = template;
		this.steamUsers = [];
    }
    
    /* Life Cycle */
    connectedCallback() {
		this.addEventListener('click', selectFileDialog.bind(this));
		this.addEventListener('contextmenu', contextMenu.bind(this), false);
		
		(localStorage["avatarSquared"] == "true") ?  this.classList.remove("round") : this.classList.add("round");
		
		this.update();
    } 
    
    disconnectedCallback() {
		this.removeEventListener('click', selectFileDialog.bind(this));
		this.removeEventListener('contextmenu', contextMenu.bind(this), false);
    }
    
    /* Custom method */
    
    update(){
		const self = this;
		getAvatar().then((avatar) => { self.style["background"] = `url(${avatar})` }).catch(()=>{/*Do Nothing*/});
    }
    
}