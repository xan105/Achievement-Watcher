_NodeType = function () {
  this.invalid = 0;
  this.elementNode = 1;
  this.attributeNode = 2;
  this.textNode = 3;
  this.dataSectionNode = 4;
  this.entityReferenceNode = 5;
  this.entityNode = 6;
  this.processingInstructionNode = 7;
  this.commentNode = 8;
  this.documentNode = 9;
  this.documentTypeNode = 10;
  this.documentFragmentNode = 11;
  this.notationNode = 12;
}
exports.NodeType = new _NodeType();

IXmlNodeSelector = (function () {
  var cls = function IXmlNodeSelector() {
  };
  

  cls.prototype.selectSingleNode = function selectSingleNode(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodes = function selectNodes(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.selectSingleNodeNS = function selectSingleNodeNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodesNS = function selectNodesNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  return cls;
}) ();
exports.IXmlNodeSelector = IXmlNodeSelector;

XmlNodeList = (function () {
  var cls = function XmlNodeList() {
    this.length = new Number();
  };
  

  cls.prototype.item = function item(index) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="index" type="Number">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.getAt = function getAt(index) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="index" type="Number">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.indexOf = function indexOf(value, index) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="value" type="IXmlNode">A param.</param>
    /// <param name="index" type="Number">A param.</param>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  cls.prototype.getMany = function getMany(startIndex, items) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="startIndex" type="Number">A param.</param>
    /// <param name="items" type="Array<Object>">A param.</param>
    /// <returns type="Number" />
    /// </signature>
    return new Number();
  }


  cls.prototype.first = function first() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="Object" />
    /// </signature>
    return new Object();
  }


  return cls;
}) ();
exports.XmlNodeList = XmlNodeList;

XmlNamedNodeMap = (function () {
  var cls = function XmlNamedNodeMap() {
    this.length = new Number();
  };
  

  cls.prototype.item = function item(index) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="index" type="Number">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.getNamedItem = function getNamedItem(name) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="name" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.setNamedItem = function setNamedItem(node) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="node" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.removeNamedItem = function removeNamedItem(name) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="name" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.getNamedItemNS = function getNamedItemNS(namespaceUri, name) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="namespaceUri" type="Object">A param.</param>
    /// <param name="name" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.removeNamedItemNS = function removeNamedItemNS(namespaceUri, name) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="namespaceUri" type="Object">A param.</param>
    /// <param name="name" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.setNamedItemNS = function setNamedItemNS(node) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="node" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.getAt = function getAt(index) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="index" type="Number">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.indexOf = function indexOf(value, index) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="value" type="IXmlNode">A param.</param>
    /// <param name="index" type="Number">A param.</param>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  cls.prototype.getMany = function getMany(startIndex, items) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="startIndex" type="Number">A param.</param>
    /// <param name="items" type="Array<Object>">A param.</param>
    /// <returns type="Number" />
    /// </signature>
    return new Number();
  }


  cls.prototype.first = function first() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="Object" />
    /// </signature>
    return new Object();
  }


  return cls;
}) ();
exports.XmlNamedNodeMap = XmlNamedNodeMap;

XmlDocument = (function () {
  var cls = function XmlDocument() {
    this.doctype = new XmlDocumentType();
    this.documentElement = new XmlElement();
    this.documentUri = new String();
    this.implementation = new XmlDomImplementation();
    this.prefix = new Object();
    this.nodeValue = new Object();
    this.firstChild = new IXmlNode();
    this.lastChild = new IXmlNode();
    this.localName = new Object();
    this.namespaceUri = new Object();
    this.nextSibling = new IXmlNode();
    this.nodeName = new String();
    this.nodeType = new NodeType();
    this.attributes = new XmlNamedNodeMap();
    this.childNodes = new XmlNodeList();
    this.parentNode = new IXmlNode();
    this.ownerDocument = new XmlDocument();
    this.previousSibling = new IXmlNode();
    this.innerText = new String();
  };
  

  cls.prototype.saveToFileAsync = function saveToFileAsync(file, callback) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="file" type="Object">A param.</param>
    /// </signature>
  }


  cls.prototype.loadXmlFromBuffer = function loadXmlFromBuffer(buffer) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="buffer" type="Object">A param.</param>
    /// </signature>
  }

cls.prototype.loadXmlFromBuffer = function loadXmlFromBuffer(buffer, loadSettings) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="buffer" type="Object">A param.</param>
    /// <param name="loadSettings" type="XmlLoadSettings">A param.</param>
    /// </signature>
  }


  cls.prototype.createElement = function createElement(tagName) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="tagName" type="String">A param.</param>
    /// <returns type="XmlElement" />
    /// </signature>
    return new XmlElement();
  }


  cls.prototype.createDocumentFragment = function createDocumentFragment() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="XmlDocumentFragment" />
    /// </signature>
    return new XmlDocumentFragment();
  }


  cls.prototype.createTextNode = function createTextNode(data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="data" type="String">A param.</param>
    /// <returns type="XmlText" />
    /// </signature>
    return new XmlText();
  }


  cls.prototype.createComment = function createComment(data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="data" type="String">A param.</param>
    /// <returns type="XmlComment" />
    /// </signature>
    return new XmlComment();
  }


  cls.prototype.createProcessingInstruction = function createProcessingInstruction(target, data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="target" type="String">A param.</param>
    /// <param name="data" type="String">A param.</param>
    /// <returns type="XmlProcessingInstruction" />
    /// </signature>
    return new XmlProcessingInstruction();
  }


  cls.prototype.createAttribute = function createAttribute(name) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="name" type="String">A param.</param>
    /// <returns type="XmlAttribute" />
    /// </signature>
    return new XmlAttribute();
  }


  cls.prototype.createEntityReference = function createEntityReference(name) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="name" type="String">A param.</param>
    /// <returns type="XmlEntityReference" />
    /// </signature>
    return new XmlEntityReference();
  }


  cls.prototype.getElementsByTagName = function getElementsByTagName(tagName) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="tagName" type="String">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.createCDataSection = function createCDataSection(data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="data" type="String">A param.</param>
    /// <returns type="XmlCDataSection" />
    /// </signature>
    return new XmlCDataSection();
  }


  cls.prototype.createAttributeNS = function createAttributeNS(namespaceUri, qualifiedName) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="namespaceUri" type="Object">A param.</param>
    /// <param name="qualifiedName" type="String">A param.</param>
    /// <returns type="XmlAttribute" />
    /// </signature>
    return new XmlAttribute();
  }


  cls.prototype.createElementNS = function createElementNS(namespaceUri, qualifiedName) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="namespaceUri" type="Object">A param.</param>
    /// <param name="qualifiedName" type="String">A param.</param>
    /// <returns type="XmlElement" />
    /// </signature>
    return new XmlElement();
  }


  cls.prototype.getElementById = function getElementById(elementId) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="elementId" type="String">A param.</param>
    /// <returns type="XmlElement" />
    /// </signature>
    return new XmlElement();
  }


  cls.prototype.importNode = function importNode(node, deep) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="node" type="IXmlNode">A param.</param>
    /// <param name="deep" type="Boolean">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.hasChildNodes = function hasChildNodes() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  cls.prototype.insertBefore = function insertBefore(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.replaceChild = function replaceChild(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.removeChild = function removeChild(childNode) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="childNode" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.appendChild = function appendChild(newChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.cloneNode = function cloneNode(deep) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="deep" type="Boolean">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.normalize = function normalize() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// </signature>
  }


  cls.prototype.selectSingleNode = function selectSingleNode(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodes = function selectNodes(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.selectSingleNodeNS = function selectSingleNodeNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodesNS = function selectNodesNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.getXml = function getXml() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  cls.prototype.loadXml = function loadXml(xml) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xml" type="String">A param.</param>
    /// </signature>
  }

cls.prototype.loadXml = function loadXml(xml, loadSettings) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xml" type="String">A param.</param>
    /// <param name="loadSettings" type="XmlLoadSettings">A param.</param>
    /// </signature>
  }


  cls.loadFromUriAsync = function loadFromUriAsync(uri, callback) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="uri" type="Object">A param.</param>
    /// </signature>
  }

cls.loadFromUriAsync = function loadFromUriAsync(uri, loadSettings, callback) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="uri" type="Object">A param.</param>
    /// <param name="loadSettings" type="XmlLoadSettings">A param.</param>
    /// </signature>
  }



  cls.loadFromFileAsync = function loadFromFileAsync(file, callback) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="file" type="Object">A param.</param>
    /// </signature>
  }

cls.loadFromFileAsync = function loadFromFileAsync(file, loadSettings, callback) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="file" type="Object">A param.</param>
    /// <param name="loadSettings" type="XmlLoadSettings">A param.</param>
    /// </signature>
  }



  return cls;
}) ();
exports.XmlDocument = XmlDocument;

IXmlNodeSerializer = (function () {
  var cls = function IXmlNodeSerializer() {
    this.innerText = new String();
  };
  

  cls.prototype.getXml = function getXml() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  return cls;
}) ();
exports.IXmlNodeSerializer = IXmlNodeSerializer;

IXmlNode = (function () {
  var cls = function IXmlNode() {
    this.attributes = new XmlNamedNodeMap();
    this.childNodes = new XmlNodeList();
    this.firstChild = new IXmlNode();
    this.lastChild = new IXmlNode();
    this.localName = new Object();
    this.namespaceUri = new Object();
    this.nextSibling = new IXmlNode();
    this.nodeName = new String();
    this.nodeType = new NodeType();
    this.nodeValue = new Object();
    this.ownerDocument = new XmlDocument();
    this.parentNode = new IXmlNode();
    this.prefix = new Object();
    this.previousSibling = new IXmlNode();
  };
  

  cls.prototype.hasChildNodes = function hasChildNodes() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  cls.prototype.insertBefore = function insertBefore(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.replaceChild = function replaceChild(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.removeChild = function removeChild(childNode) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="childNode" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.appendChild = function appendChild(newChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.cloneNode = function cloneNode(deep) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="deep" type="Boolean">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.normalize = function normalize() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// </signature>
  }


  return cls;
}) ();
exports.IXmlNode = IXmlNode;

XmlAttribute = (function () {
  var cls = function XmlAttribute() {
    this.value = new String();
    this.specified = new Boolean();
    this.name = new String();
    this.prefix = new Object();
    this.nodeValue = new Object();
    this.firstChild = new IXmlNode();
    this.lastChild = new IXmlNode();
    this.localName = new Object();
    this.namespaceUri = new Object();
    this.nextSibling = new IXmlNode();
    this.nodeName = new String();
    this.nodeType = new NodeType();
    this.attributes = new XmlNamedNodeMap();
    this.ownerDocument = new XmlDocument();
    this.childNodes = new XmlNodeList();
    this.parentNode = new IXmlNode();
    this.previousSibling = new IXmlNode();
    this.innerText = new String();
  };
  

  cls.prototype.hasChildNodes = function hasChildNodes() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  cls.prototype.insertBefore = function insertBefore(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.replaceChild = function replaceChild(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.removeChild = function removeChild(childNode) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="childNode" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.appendChild = function appendChild(newChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.cloneNode = function cloneNode(deep) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="deep" type="Boolean">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.normalize = function normalize() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// </signature>
  }


  cls.prototype.selectSingleNode = function selectSingleNode(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodes = function selectNodes(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.selectSingleNodeNS = function selectSingleNodeNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodesNS = function selectNodesNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.getXml = function getXml() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  return cls;
}) ();
exports.XmlAttribute = XmlAttribute;

IXmlCharacterData = (function () {
  var cls = function IXmlCharacterData() {
    this.data = new String();
    this.length = new Number();
  };
  

  cls.prototype.substringData = function substringData(offset, count) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="count" type="Number">A param.</param>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  cls.prototype.appendData = function appendData(data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="data" type="String">A param.</param>
    /// </signature>
  }


  cls.prototype.insertData = function insertData(offset, data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="data" type="String">A param.</param>
    /// </signature>
  }


  cls.prototype.deleteData = function deleteData(offset, count) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="count" type="Number">A param.</param>
    /// </signature>
  }


  cls.prototype.replaceData = function replaceData(offset, count, data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="count" type="Number">A param.</param>
    /// <param name="data" type="String">A param.</param>
    /// </signature>
  }


  return cls;
}) ();
exports.IXmlCharacterData = IXmlCharacterData;

IXmlText = (function () {
  var cls = function IXmlText() {
  };
  

  cls.prototype.splitText = function splitText(offset) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <returns type="IXmlText" />
    /// </signature>
    return new IXmlText();
  }


  return cls;
}) ();
exports.IXmlText = IXmlText;

XmlDocumentType = (function () {
  var cls = function XmlDocumentType() {
    this.entities = new XmlNamedNodeMap();
    this.name = new String();
    this.notations = new XmlNamedNodeMap();
    this.prefix = new Object();
    this.nodeValue = new Object();
    this.firstChild = new IXmlNode();
    this.lastChild = new IXmlNode();
    this.localName = new Object();
    this.namespaceUri = new Object();
    this.nextSibling = new IXmlNode();
    this.nodeName = new String();
    this.nodeType = new NodeType();
    this.attributes = new XmlNamedNodeMap();
    this.ownerDocument = new XmlDocument();
    this.childNodes = new XmlNodeList();
    this.parentNode = new IXmlNode();
    this.previousSibling = new IXmlNode();
    this.innerText = new String();
  };
  

  cls.prototype.hasChildNodes = function hasChildNodes() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  cls.prototype.insertBefore = function insertBefore(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.replaceChild = function replaceChild(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.removeChild = function removeChild(childNode) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="childNode" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.appendChild = function appendChild(newChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.cloneNode = function cloneNode(deep) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="deep" type="Boolean">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.normalize = function normalize() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// </signature>
  }


  cls.prototype.selectSingleNode = function selectSingleNode(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodes = function selectNodes(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.selectSingleNodeNS = function selectSingleNodeNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodesNS = function selectNodesNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.getXml = function getXml() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  return cls;
}) ();
exports.XmlDocumentType = XmlDocumentType;

XmlDomImplementation = (function () {
  var cls = function XmlDomImplementation() {
  };
  

  cls.prototype.hasFeature = function hasFeature(feature, version) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="feature" type="String">A param.</param>
    /// <param name="version" type="Object">A param.</param>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  return cls;
}) ();
exports.XmlDomImplementation = XmlDomImplementation;

XmlElement = (function () {
  var cls = function XmlElement() {
    this.tagName = new String();
    this.prefix = new Object();
    this.nodeValue = new Object();
    this.firstChild = new IXmlNode();
    this.lastChild = new IXmlNode();
    this.localName = new Object();
    this.nextSibling = new IXmlNode();
    this.namespaceUri = new Object();
    this.nodeType = new NodeType();
    this.nodeName = new String();
    this.attributes = new XmlNamedNodeMap();
    this.ownerDocument = new XmlDocument();
    this.parentNode = new IXmlNode();
    this.childNodes = new XmlNodeList();
    this.previousSibling = new IXmlNode();
    this.innerText = new String();
  };
  

  cls.prototype.getAttribute = function getAttribute(attributeName) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="attributeName" type="String">A param.</param>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  cls.prototype.setAttribute = function setAttribute(attributeName, attributeValue) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="attributeName" type="String">A param.</param>
    /// <param name="attributeValue" type="String">A param.</param>
    /// </signature>
  }


  cls.prototype.removeAttribute = function removeAttribute(attributeName) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="attributeName" type="String">A param.</param>
    /// </signature>
  }


  cls.prototype.getAttributeNode = function getAttributeNode(attributeName) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="attributeName" type="String">A param.</param>
    /// <returns type="XmlAttribute" />
    /// </signature>
    return new XmlAttribute();
  }


  cls.prototype.setAttributeNode = function setAttributeNode(newAttribute) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newAttribute" type="XmlAttribute">A param.</param>
    /// <returns type="XmlAttribute" />
    /// </signature>
    return new XmlAttribute();
  }


  cls.prototype.removeAttributeNode = function removeAttributeNode(attributeNode) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="attributeNode" type="XmlAttribute">A param.</param>
    /// <returns type="XmlAttribute" />
    /// </signature>
    return new XmlAttribute();
  }


  cls.prototype.getElementsByTagName = function getElementsByTagName(tagName) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="tagName" type="String">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.setAttributeNS = function setAttributeNS(namespaceUri, qualifiedName, value) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="namespaceUri" type="Object">A param.</param>
    /// <param name="qualifiedName" type="String">A param.</param>
    /// <param name="value" type="String">A param.</param>
    /// </signature>
  }


  cls.prototype.getAttributeNS = function getAttributeNS(namespaceUri, localName) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="namespaceUri" type="Object">A param.</param>
    /// <param name="localName" type="String">A param.</param>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  cls.prototype.removeAttributeNS = function removeAttributeNS(namespaceUri, localName) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="namespaceUri" type="Object">A param.</param>
    /// <param name="localName" type="String">A param.</param>
    /// </signature>
  }


  cls.prototype.setAttributeNodeNS = function setAttributeNodeNS(newAttribute) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newAttribute" type="XmlAttribute">A param.</param>
    /// <returns type="XmlAttribute" />
    /// </signature>
    return new XmlAttribute();
  }


  cls.prototype.getAttributeNodeNS = function getAttributeNodeNS(namespaceUri, localName) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="namespaceUri" type="Object">A param.</param>
    /// <param name="localName" type="String">A param.</param>
    /// <returns type="XmlAttribute" />
    /// </signature>
    return new XmlAttribute();
  }


  cls.prototype.hasChildNodes = function hasChildNodes() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  cls.prototype.insertBefore = function insertBefore(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.replaceChild = function replaceChild(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.removeChild = function removeChild(childNode) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="childNode" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.appendChild = function appendChild(newChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.cloneNode = function cloneNode(deep) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="deep" type="Boolean">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.normalize = function normalize() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// </signature>
  }


  cls.prototype.selectSingleNode = function selectSingleNode(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodes = function selectNodes(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.selectSingleNodeNS = function selectSingleNodeNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodesNS = function selectNodesNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.getXml = function getXml() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  return cls;
}) ();
exports.XmlElement = XmlElement;

XmlDocumentFragment = (function () {
  var cls = function XmlDocumentFragment() {
    this.prefix = new Object();
    this.nodeValue = new Object();
    this.firstChild = new IXmlNode();
    this.lastChild = new IXmlNode();
    this.localName = new Object();
    this.namespaceUri = new Object();
    this.nextSibling = new IXmlNode();
    this.nodeName = new String();
    this.nodeType = new NodeType();
    this.attributes = new XmlNamedNodeMap();
    this.ownerDocument = new XmlDocument();
    this.parentNode = new IXmlNode();
    this.childNodes = new XmlNodeList();
    this.previousSibling = new IXmlNode();
    this.innerText = new String();
  };
  

  cls.prototype.hasChildNodes = function hasChildNodes() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  cls.prototype.insertBefore = function insertBefore(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.replaceChild = function replaceChild(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.removeChild = function removeChild(childNode) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="childNode" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.appendChild = function appendChild(newChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.cloneNode = function cloneNode(deep) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="deep" type="Boolean">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.normalize = function normalize() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// </signature>
  }


  cls.prototype.selectSingleNode = function selectSingleNode(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodes = function selectNodes(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.selectSingleNodeNS = function selectSingleNodeNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodesNS = function selectNodesNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.getXml = function getXml() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  return cls;
}) ();
exports.XmlDocumentFragment = XmlDocumentFragment;

XmlText = (function () {
  var cls = function XmlText() {
    this.data = new String();
    this.length = new Number();
    this.prefix = new Object();
    this.nodeValue = new Object();
    this.firstChild = new IXmlNode();
    this.lastChild = new IXmlNode();
    this.localName = new Object();
    this.namespaceUri = new Object();
    this.nextSibling = new IXmlNode();
    this.nodeName = new String();
    this.nodeType = new NodeType();
    this.attributes = new XmlNamedNodeMap();
    this.ownerDocument = new XmlDocument();
    this.childNodes = new XmlNodeList();
    this.parentNode = new IXmlNode();
    this.previousSibling = new IXmlNode();
    this.innerText = new String();
  };
  

  cls.prototype.splitText = function splitText(offset) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <returns type="IXmlText" />
    /// </signature>
    return new IXmlText();
  }


  cls.prototype.substringData = function substringData(offset, count) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="count" type="Number">A param.</param>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  cls.prototype.appendData = function appendData(data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="data" type="String">A param.</param>
    /// </signature>
  }


  cls.prototype.insertData = function insertData(offset, data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="data" type="String">A param.</param>
    /// </signature>
  }


  cls.prototype.deleteData = function deleteData(offset, count) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="count" type="Number">A param.</param>
    /// </signature>
  }


  cls.prototype.replaceData = function replaceData(offset, count, data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="count" type="Number">A param.</param>
    /// <param name="data" type="String">A param.</param>
    /// </signature>
  }


  cls.prototype.hasChildNodes = function hasChildNodes() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  cls.prototype.insertBefore = function insertBefore(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.replaceChild = function replaceChild(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.removeChild = function removeChild(childNode) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="childNode" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.appendChild = function appendChild(newChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.cloneNode = function cloneNode(deep) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="deep" type="Boolean">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.normalize = function normalize() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// </signature>
  }


  cls.prototype.selectSingleNode = function selectSingleNode(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodes = function selectNodes(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.selectSingleNodeNS = function selectSingleNodeNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodesNS = function selectNodesNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.getXml = function getXml() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  return cls;
}) ();
exports.XmlText = XmlText;

XmlComment = (function () {
  var cls = function XmlComment() {
    this.data = new String();
    this.length = new Number();
    this.prefix = new Object();
    this.nodeValue = new Object();
    this.firstChild = new IXmlNode();
    this.lastChild = new IXmlNode();
    this.localName = new Object();
    this.namespaceUri = new Object();
    this.nextSibling = new IXmlNode();
    this.nodeName = new String();
    this.nodeType = new NodeType();
    this.attributes = new XmlNamedNodeMap();
    this.ownerDocument = new XmlDocument();
    this.childNodes = new XmlNodeList();
    this.parentNode = new IXmlNode();
    this.previousSibling = new IXmlNode();
    this.innerText = new String();
  };
  

  cls.prototype.substringData = function substringData(offset, count) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="count" type="Number">A param.</param>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  cls.prototype.appendData = function appendData(data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="data" type="String">A param.</param>
    /// </signature>
  }


  cls.prototype.insertData = function insertData(offset, data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="data" type="String">A param.</param>
    /// </signature>
  }


  cls.prototype.deleteData = function deleteData(offset, count) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="count" type="Number">A param.</param>
    /// </signature>
  }


  cls.prototype.replaceData = function replaceData(offset, count, data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="count" type="Number">A param.</param>
    /// <param name="data" type="String">A param.</param>
    /// </signature>
  }


  cls.prototype.hasChildNodes = function hasChildNodes() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  cls.prototype.insertBefore = function insertBefore(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.replaceChild = function replaceChild(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.removeChild = function removeChild(childNode) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="childNode" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.appendChild = function appendChild(newChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.cloneNode = function cloneNode(deep) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="deep" type="Boolean">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.normalize = function normalize() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// </signature>
  }


  cls.prototype.selectSingleNode = function selectSingleNode(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodes = function selectNodes(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.selectSingleNodeNS = function selectSingleNodeNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodesNS = function selectNodesNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.getXml = function getXml() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  return cls;
}) ();
exports.XmlComment = XmlComment;

XmlProcessingInstruction = (function () {
  var cls = function XmlProcessingInstruction() {
    this.prefix = new Object();
    this.nodeValue = new Object();
    this.attributes = new XmlNamedNodeMap();
    this.firstChild = new IXmlNode();
    this.childNodes = new XmlNodeList();
    this.lastChild = new IXmlNode();
    this.localName = new Object();
    this.namespaceUri = new Object();
    this.nextSibling = new IXmlNode();
    this.nodeName = new String();
    this.nodeType = new NodeType();
    this.ownerDocument = new XmlDocument();
    this.parentNode = new IXmlNode();
    this.previousSibling = new IXmlNode();
    this.innerText = new String();
    this.data = new String();
    this.target = new String();
  };
  

  cls.prototype.hasChildNodes = function hasChildNodes() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  cls.prototype.insertBefore = function insertBefore(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.replaceChild = function replaceChild(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.removeChild = function removeChild(childNode) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="childNode" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.appendChild = function appendChild(newChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.cloneNode = function cloneNode(deep) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="deep" type="Boolean">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.normalize = function normalize() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// </signature>
  }


  cls.prototype.selectSingleNode = function selectSingleNode(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodes = function selectNodes(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.selectSingleNodeNS = function selectSingleNodeNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodesNS = function selectNodesNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.getXml = function getXml() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  return cls;
}) ();
exports.XmlProcessingInstruction = XmlProcessingInstruction;

XmlEntityReference = (function () {
  var cls = function XmlEntityReference() {
    this.prefix = new Object();
    this.nodeValue = new Object();
    this.firstChild = new IXmlNode();
    this.lastChild = new IXmlNode();
    this.localName = new Object();
    this.namespaceUri = new Object();
    this.nextSibling = new IXmlNode();
    this.nodeName = new String();
    this.nodeType = new NodeType();
    this.attributes = new XmlNamedNodeMap();
    this.ownerDocument = new XmlDocument();
    this.parentNode = new IXmlNode();
    this.childNodes = new XmlNodeList();
    this.previousSibling = new IXmlNode();
    this.innerText = new String();
  };
  

  cls.prototype.hasChildNodes = function hasChildNodes() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  cls.prototype.insertBefore = function insertBefore(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.replaceChild = function replaceChild(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.removeChild = function removeChild(childNode) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="childNode" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.appendChild = function appendChild(newChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.cloneNode = function cloneNode(deep) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="deep" type="Boolean">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.normalize = function normalize() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// </signature>
  }


  cls.prototype.selectSingleNode = function selectSingleNode(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodes = function selectNodes(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.selectSingleNodeNS = function selectSingleNodeNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodesNS = function selectNodesNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.getXml = function getXml() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  return cls;
}) ();
exports.XmlEntityReference = XmlEntityReference;

XmlCDataSection = (function () {
  var cls = function XmlCDataSection() {
    this.data = new String();
    this.length = new Number();
    this.prefix = new Object();
    this.nodeValue = new Object();
    this.firstChild = new IXmlNode();
    this.lastChild = new IXmlNode();
    this.localName = new Object();
    this.namespaceUri = new Object();
    this.nextSibling = new IXmlNode();
    this.nodeName = new String();
    this.nodeType = new NodeType();
    this.attributes = new XmlNamedNodeMap();
    this.ownerDocument = new XmlDocument();
    this.childNodes = new XmlNodeList();
    this.parentNode = new IXmlNode();
    this.previousSibling = new IXmlNode();
    this.innerText = new String();
  };
  

  cls.prototype.splitText = function splitText(offset) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <returns type="IXmlText" />
    /// </signature>
    return new IXmlText();
  }


  cls.prototype.substringData = function substringData(offset, count) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="count" type="Number">A param.</param>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  cls.prototype.appendData = function appendData(data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="data" type="String">A param.</param>
    /// </signature>
  }


  cls.prototype.insertData = function insertData(offset, data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="data" type="String">A param.</param>
    /// </signature>
  }


  cls.prototype.deleteData = function deleteData(offset, count) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="count" type="Number">A param.</param>
    /// </signature>
  }


  cls.prototype.replaceData = function replaceData(offset, count, data) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="offset" type="Number">A param.</param>
    /// <param name="count" type="Number">A param.</param>
    /// <param name="data" type="String">A param.</param>
    /// </signature>
  }


  cls.prototype.hasChildNodes = function hasChildNodes() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  cls.prototype.insertBefore = function insertBefore(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.replaceChild = function replaceChild(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.removeChild = function removeChild(childNode) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="childNode" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.appendChild = function appendChild(newChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.cloneNode = function cloneNode(deep) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="deep" type="Boolean">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.normalize = function normalize() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// </signature>
  }


  cls.prototype.selectSingleNode = function selectSingleNode(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodes = function selectNodes(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.selectSingleNodeNS = function selectSingleNodeNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodesNS = function selectNodesNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.getXml = function getXml() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  return cls;
}) ();
exports.XmlCDataSection = XmlCDataSection;

XmlLoadSettings = (function () {
  var cls = function XmlLoadSettings() {
    this.validateOnParse = new Boolean();
    this.resolveExternals = new Boolean();
    this.prohibitDtd = new Boolean();
    this.maxElementDepth = new Number();
    this.elementContentWhiteSpace = new Boolean();
  };
  

  return cls;
}) ();
exports.XmlLoadSettings = XmlLoadSettings;

DtdNotation = (function () {
  var cls = function DtdNotation() {
    this.publicId = new Object();
    this.systemId = new Object();
    this.prefix = new Object();
    this.nodeValue = new Object();
    this.firstChild = new IXmlNode();
    this.lastChild = new IXmlNode();
    this.localName = new Object();
    this.namespaceUri = new Object();
    this.nextSibling = new IXmlNode();
    this.nodeName = new String();
    this.nodeType = new NodeType();
    this.attributes = new XmlNamedNodeMap();
    this.ownerDocument = new XmlDocument();
    this.childNodes = new XmlNodeList();
    this.parentNode = new IXmlNode();
    this.previousSibling = new IXmlNode();
    this.innerText = new String();
  };
  

  cls.prototype.hasChildNodes = function hasChildNodes() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  cls.prototype.insertBefore = function insertBefore(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.replaceChild = function replaceChild(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.removeChild = function removeChild(childNode) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="childNode" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.appendChild = function appendChild(newChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.cloneNode = function cloneNode(deep) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="deep" type="Boolean">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.normalize = function normalize() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// </signature>
  }


  cls.prototype.selectSingleNode = function selectSingleNode(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodes = function selectNodes(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.selectSingleNodeNS = function selectSingleNodeNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodesNS = function selectNodesNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.getXml = function getXml() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  return cls;
}) ();
exports.DtdNotation = DtdNotation;

DtdEntity = (function () {
  var cls = function DtdEntity() {
    this.notationName = new Object();
    this.publicId = new Object();
    this.systemId = new Object();
    this.prefix = new Object();
    this.nodeValue = new Object();
    this.firstChild = new IXmlNode();
    this.lastChild = new IXmlNode();
    this.localName = new Object();
    this.namespaceUri = new Object();
    this.nextSibling = new IXmlNode();
    this.nodeName = new String();
    this.nodeType = new NodeType();
    this.attributes = new XmlNamedNodeMap();
    this.ownerDocument = new XmlDocument();
    this.childNodes = new XmlNodeList();
    this.parentNode = new IXmlNode();
    this.previousSibling = new IXmlNode();
    this.innerText = new String();
  };
  

  cls.prototype.hasChildNodes = function hasChildNodes() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="Boolean" />
    /// </signature>
    return new Boolean();
  }


  cls.prototype.insertBefore = function insertBefore(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.replaceChild = function replaceChild(newChild, referenceChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <param name="referenceChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.removeChild = function removeChild(childNode) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="childNode" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.appendChild = function appendChild(newChild) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="newChild" type="IXmlNode">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.cloneNode = function cloneNode(deep) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="deep" type="Boolean">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.normalize = function normalize() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// </signature>
  }


  cls.prototype.selectSingleNode = function selectSingleNode(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodes = function selectNodes(xpath) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.selectSingleNodeNS = function selectSingleNodeNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="IXmlNode" />
    /// </signature>
    return new IXmlNode();
  }


  cls.prototype.selectNodesNS = function selectNodesNS(xpath, namespaces) {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <param name="xpath" type="String">A param.</param>
    /// <param name="namespaces" type="Object">A param.</param>
    /// <returns type="XmlNodeList" />
    /// </signature>
    return new XmlNodeList();
  }


  cls.prototype.getXml = function getXml() {
    /// <signature>
    /// <summary>Function summary.</summary>
    /// <returns type="String" />
    /// </signature>
    return new String();
  }


  return cls;
}) ();
exports.DtdEntity = DtdEntity;

