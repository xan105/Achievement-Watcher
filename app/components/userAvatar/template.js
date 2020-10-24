const template = `

  <style>
  
    :host { 
		background: url(../resources/img/avatar.png);
		background-color: #27374a;
		background-repeat: no-repeat !important;
		background-size: cover !important;
		background-position: center !important;
		width: 96px;
		height: 96px; 
		border: solid white 2px;
		margin: 10px;
		box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    }
    
    :host(:hover) {
		cursor: pointer;
		box-shadow: rgba(198, 212, 223, 0.5) 0px 0px 8px 2px;
		color: #d9dfe4;
	}
    
    :host(.round) {
		border-radius: 50%;
    }
  
  </style>

`;

export { template };