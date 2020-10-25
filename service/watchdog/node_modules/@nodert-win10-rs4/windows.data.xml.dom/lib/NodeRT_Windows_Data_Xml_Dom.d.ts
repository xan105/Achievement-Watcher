declare module "windows.data.xml.dom" {
  export enum NodeType {
    invalid,
    elementNode,
    attributeNode,
    textNode,
    dataSectionNode,
    entityReferenceNode,
    entityNode,
    processingInstructionNode,
    commentNode,
    documentNode,
    documentTypeNode,
    documentFragmentNode,
    notationNode,
  }

  export class IXmlNodeSelector {
    constructor();

    selectSingleNode(xpath: String): IXmlNode;

    selectNodes(xpath: String): XmlNodeList;

    selectSingleNodeNS(xpath: String, namespaces: Object): IXmlNode;

    selectNodesNS(xpath: String, namespaces: Object): XmlNodeList;

  }

  export class XmlNodeList {
    length: Number;
    constructor();

    item(index: Number): IXmlNode;

    getAt(index: Number): IXmlNode;

    indexOf(value: IXmlNode, index: Number): Boolean;

    getMany(startIndex: Number, items: Array<Object>): Number;

    first(): Object;

  }

  export class XmlNamedNodeMap {
    length: Number;
    constructor();

    item(index: Number): IXmlNode;

    getNamedItem(name: String): IXmlNode;

    setNamedItem(node: IXmlNode): IXmlNode;

    removeNamedItem(name: String): IXmlNode;

    getNamedItemNS(namespaceUri: Object, name: String): IXmlNode;

    removeNamedItemNS(namespaceUri: Object, name: String): IXmlNode;

    setNamedItemNS(node: IXmlNode): IXmlNode;

    getAt(index: Number): IXmlNode;

    indexOf(value: IXmlNode, index: Number): Boolean;

    getMany(startIndex: Number, items: Array<Object>): Number;

    first(): Object;

  }

  export class XmlDocument {
    doctype: XmlDocumentType;
    documentElement: XmlElement;
    documentUri: String;
    implementation: XmlDomImplementation;
    prefix: Object;
    nodeValue: Object;
    firstChild: IXmlNode;
    lastChild: IXmlNode;
    localName: Object;
    namespaceUri: Object;
    nextSibling: IXmlNode;
    nodeName: String;
    nodeType: NodeType;
    attributes: XmlNamedNodeMap;
    childNodes: XmlNodeList;
    parentNode: IXmlNode;
    ownerDocument: XmlDocument;
    previousSibling: IXmlNode;
    innerText: String;
    constructor();

    static loadFromUriAsync(uri: Object, callback: (error: Error, result: XmlDocument) => void): void ;
    static loadFromUriAsync(uri: Object, loadSettings: XmlLoadSettings, callback: (error: Error, result: XmlDocument) => void): void ;


    static loadFromFileAsync(file: Object, callback: (error: Error, result: XmlDocument) => void): void ;
    static loadFromFileAsync(file: Object, loadSettings: XmlLoadSettings, callback: (error: Error, result: XmlDocument) => void): void ;


    saveToFileAsync(file: Object, callback: (error: Error) => void): void ;

    loadXmlFromBuffer(buffer: Object): void;
    loadXmlFromBuffer(buffer: Object, loadSettings: XmlLoadSettings): void;

    createElement(tagName: String): XmlElement;

    createDocumentFragment(): XmlDocumentFragment;

    createTextNode(data: String): XmlText;

    createComment(data: String): XmlComment;

    createProcessingInstruction(target: String, data: String): XmlProcessingInstruction;

    createAttribute(name: String): XmlAttribute;

    createEntityReference(name: String): XmlEntityReference;

    getElementsByTagName(tagName: String): XmlNodeList;

    createCDataSection(data: String): XmlCDataSection;

    createAttributeNS(namespaceUri: Object, qualifiedName: String): XmlAttribute;

    createElementNS(namespaceUri: Object, qualifiedName: String): XmlElement;

    getElementById(elementId: String): XmlElement;

    importNode(node: IXmlNode, deep: Boolean): IXmlNode;

    hasChildNodes(): Boolean;

    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    removeChild(childNode: IXmlNode): IXmlNode;

    appendChild(newChild: IXmlNode): IXmlNode;

    cloneNode(deep: Boolean): IXmlNode;

    normalize(): void;

    selectSingleNode(xpath: String): IXmlNode;

    selectNodes(xpath: String): XmlNodeList;

    selectSingleNodeNS(xpath: String, namespaces: Object): IXmlNode;

    selectNodesNS(xpath: String, namespaces: Object): XmlNodeList;

    getXml(): String;

    loadXml(xml: String): void;
    loadXml(xml: String, loadSettings: XmlLoadSettings): void;

  }

  export class IXmlNodeSerializer {
    innerText: String;
    constructor();

    getXml(): String;

  }

  export class IXmlNode {
    attributes: XmlNamedNodeMap;
    childNodes: XmlNodeList;
    firstChild: IXmlNode;
    lastChild: IXmlNode;
    localName: Object;
    namespaceUri: Object;
    nextSibling: IXmlNode;
    nodeName: String;
    nodeType: NodeType;
    nodeValue: Object;
    ownerDocument: XmlDocument;
    parentNode: IXmlNode;
    prefix: Object;
    previousSibling: IXmlNode;
    constructor();

    hasChildNodes(): Boolean;

    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    removeChild(childNode: IXmlNode): IXmlNode;

    appendChild(newChild: IXmlNode): IXmlNode;

    cloneNode(deep: Boolean): IXmlNode;

    normalize(): void;

  }

  export class XmlAttribute {
    value: String;
    specified: Boolean;
    name: String;
    prefix: Object;
    nodeValue: Object;
    firstChild: IXmlNode;
    lastChild: IXmlNode;
    localName: Object;
    namespaceUri: Object;
    nextSibling: IXmlNode;
    nodeName: String;
    nodeType: NodeType;
    attributes: XmlNamedNodeMap;
    ownerDocument: XmlDocument;
    childNodes: XmlNodeList;
    parentNode: IXmlNode;
    previousSibling: IXmlNode;
    innerText: String;
    constructor();

    hasChildNodes(): Boolean;

    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    removeChild(childNode: IXmlNode): IXmlNode;

    appendChild(newChild: IXmlNode): IXmlNode;

    cloneNode(deep: Boolean): IXmlNode;

    normalize(): void;

    selectSingleNode(xpath: String): IXmlNode;

    selectNodes(xpath: String): XmlNodeList;

    selectSingleNodeNS(xpath: String, namespaces: Object): IXmlNode;

    selectNodesNS(xpath: String, namespaces: Object): XmlNodeList;

    getXml(): String;

  }

  export class IXmlCharacterData {
    data: String;
    length: Number;
    constructor();

    substringData(offset: Number, count: Number): String;

    appendData(data: String): void;

    insertData(offset: Number, data: String): void;

    deleteData(offset: Number, count: Number): void;

    replaceData(offset: Number, count: Number, data: String): void;

  }

  export class IXmlText {
    constructor();

    splitText(offset: Number): IXmlText;

  }

  export class XmlDocumentType {
    entities: XmlNamedNodeMap;
    name: String;
    notations: XmlNamedNodeMap;
    prefix: Object;
    nodeValue: Object;
    firstChild: IXmlNode;
    lastChild: IXmlNode;
    localName: Object;
    namespaceUri: Object;
    nextSibling: IXmlNode;
    nodeName: String;
    nodeType: NodeType;
    attributes: XmlNamedNodeMap;
    ownerDocument: XmlDocument;
    childNodes: XmlNodeList;
    parentNode: IXmlNode;
    previousSibling: IXmlNode;
    innerText: String;
    constructor();

    hasChildNodes(): Boolean;

    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    removeChild(childNode: IXmlNode): IXmlNode;

    appendChild(newChild: IXmlNode): IXmlNode;

    cloneNode(deep: Boolean): IXmlNode;

    normalize(): void;

    selectSingleNode(xpath: String): IXmlNode;

    selectNodes(xpath: String): XmlNodeList;

    selectSingleNodeNS(xpath: String, namespaces: Object): IXmlNode;

    selectNodesNS(xpath: String, namespaces: Object): XmlNodeList;

    getXml(): String;

  }

  export class XmlDomImplementation {
    constructor();

    hasFeature(feature: String, version: Object): Boolean;

  }

  export class XmlElement {
    tagName: String;
    prefix: Object;
    nodeValue: Object;
    firstChild: IXmlNode;
    lastChild: IXmlNode;
    localName: Object;
    nextSibling: IXmlNode;
    namespaceUri: Object;
    nodeType: NodeType;
    nodeName: String;
    attributes: XmlNamedNodeMap;
    ownerDocument: XmlDocument;
    parentNode: IXmlNode;
    childNodes: XmlNodeList;
    previousSibling: IXmlNode;
    innerText: String;
    constructor();

    getAttribute(attributeName: String): String;

    setAttribute(attributeName: String, attributeValue: String): void;

    removeAttribute(attributeName: String): void;

    getAttributeNode(attributeName: String): XmlAttribute;

    setAttributeNode(newAttribute: XmlAttribute): XmlAttribute;

    removeAttributeNode(attributeNode: XmlAttribute): XmlAttribute;

    getElementsByTagName(tagName: String): XmlNodeList;

    setAttributeNS(namespaceUri: Object, qualifiedName: String, value: String): void;

    getAttributeNS(namespaceUri: Object, localName: String): String;

    removeAttributeNS(namespaceUri: Object, localName: String): void;

    setAttributeNodeNS(newAttribute: XmlAttribute): XmlAttribute;

    getAttributeNodeNS(namespaceUri: Object, localName: String): XmlAttribute;

    hasChildNodes(): Boolean;

    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    removeChild(childNode: IXmlNode): IXmlNode;

    appendChild(newChild: IXmlNode): IXmlNode;

    cloneNode(deep: Boolean): IXmlNode;

    normalize(): void;

    selectSingleNode(xpath: String): IXmlNode;

    selectNodes(xpath: String): XmlNodeList;

    selectSingleNodeNS(xpath: String, namespaces: Object): IXmlNode;

    selectNodesNS(xpath: String, namespaces: Object): XmlNodeList;

    getXml(): String;

  }

  export class XmlDocumentFragment {
    prefix: Object;
    nodeValue: Object;
    firstChild: IXmlNode;
    lastChild: IXmlNode;
    localName: Object;
    namespaceUri: Object;
    nextSibling: IXmlNode;
    nodeName: String;
    nodeType: NodeType;
    attributes: XmlNamedNodeMap;
    ownerDocument: XmlDocument;
    parentNode: IXmlNode;
    childNodes: XmlNodeList;
    previousSibling: IXmlNode;
    innerText: String;
    constructor();

    hasChildNodes(): Boolean;

    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    removeChild(childNode: IXmlNode): IXmlNode;

    appendChild(newChild: IXmlNode): IXmlNode;

    cloneNode(deep: Boolean): IXmlNode;

    normalize(): void;

    selectSingleNode(xpath: String): IXmlNode;

    selectNodes(xpath: String): XmlNodeList;

    selectSingleNodeNS(xpath: String, namespaces: Object): IXmlNode;

    selectNodesNS(xpath: String, namespaces: Object): XmlNodeList;

    getXml(): String;

  }

  export class XmlText {
    data: String;
    length: Number;
    prefix: Object;
    nodeValue: Object;
    firstChild: IXmlNode;
    lastChild: IXmlNode;
    localName: Object;
    namespaceUri: Object;
    nextSibling: IXmlNode;
    nodeName: String;
    nodeType: NodeType;
    attributes: XmlNamedNodeMap;
    ownerDocument: XmlDocument;
    childNodes: XmlNodeList;
    parentNode: IXmlNode;
    previousSibling: IXmlNode;
    innerText: String;
    constructor();

    splitText(offset: Number): IXmlText;

    substringData(offset: Number, count: Number): String;

    appendData(data: String): void;

    insertData(offset: Number, data: String): void;

    deleteData(offset: Number, count: Number): void;

    replaceData(offset: Number, count: Number, data: String): void;

    hasChildNodes(): Boolean;

    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    removeChild(childNode: IXmlNode): IXmlNode;

    appendChild(newChild: IXmlNode): IXmlNode;

    cloneNode(deep: Boolean): IXmlNode;

    normalize(): void;

    selectSingleNode(xpath: String): IXmlNode;

    selectNodes(xpath: String): XmlNodeList;

    selectSingleNodeNS(xpath: String, namespaces: Object): IXmlNode;

    selectNodesNS(xpath: String, namespaces: Object): XmlNodeList;

    getXml(): String;

  }

  export class XmlComment {
    data: String;
    length: Number;
    prefix: Object;
    nodeValue: Object;
    firstChild: IXmlNode;
    lastChild: IXmlNode;
    localName: Object;
    namespaceUri: Object;
    nextSibling: IXmlNode;
    nodeName: String;
    nodeType: NodeType;
    attributes: XmlNamedNodeMap;
    ownerDocument: XmlDocument;
    childNodes: XmlNodeList;
    parentNode: IXmlNode;
    previousSibling: IXmlNode;
    innerText: String;
    constructor();

    substringData(offset: Number, count: Number): String;

    appendData(data: String): void;

    insertData(offset: Number, data: String): void;

    deleteData(offset: Number, count: Number): void;

    replaceData(offset: Number, count: Number, data: String): void;

    hasChildNodes(): Boolean;

    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    removeChild(childNode: IXmlNode): IXmlNode;

    appendChild(newChild: IXmlNode): IXmlNode;

    cloneNode(deep: Boolean): IXmlNode;

    normalize(): void;

    selectSingleNode(xpath: String): IXmlNode;

    selectNodes(xpath: String): XmlNodeList;

    selectSingleNodeNS(xpath: String, namespaces: Object): IXmlNode;

    selectNodesNS(xpath: String, namespaces: Object): XmlNodeList;

    getXml(): String;

  }

  export class XmlProcessingInstruction {
    prefix: Object;
    nodeValue: Object;
    attributes: XmlNamedNodeMap;
    firstChild: IXmlNode;
    childNodes: XmlNodeList;
    lastChild: IXmlNode;
    localName: Object;
    namespaceUri: Object;
    nextSibling: IXmlNode;
    nodeName: String;
    nodeType: NodeType;
    ownerDocument: XmlDocument;
    parentNode: IXmlNode;
    previousSibling: IXmlNode;
    innerText: String;
    data: String;
    target: String;
    constructor();

    hasChildNodes(): Boolean;

    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    removeChild(childNode: IXmlNode): IXmlNode;

    appendChild(newChild: IXmlNode): IXmlNode;

    cloneNode(deep: Boolean): IXmlNode;

    normalize(): void;

    selectSingleNode(xpath: String): IXmlNode;

    selectNodes(xpath: String): XmlNodeList;

    selectSingleNodeNS(xpath: String, namespaces: Object): IXmlNode;

    selectNodesNS(xpath: String, namespaces: Object): XmlNodeList;

    getXml(): String;

  }

  export class XmlEntityReference {
    prefix: Object;
    nodeValue: Object;
    firstChild: IXmlNode;
    lastChild: IXmlNode;
    localName: Object;
    namespaceUri: Object;
    nextSibling: IXmlNode;
    nodeName: String;
    nodeType: NodeType;
    attributes: XmlNamedNodeMap;
    ownerDocument: XmlDocument;
    parentNode: IXmlNode;
    childNodes: XmlNodeList;
    previousSibling: IXmlNode;
    innerText: String;
    constructor();

    hasChildNodes(): Boolean;

    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    removeChild(childNode: IXmlNode): IXmlNode;

    appendChild(newChild: IXmlNode): IXmlNode;

    cloneNode(deep: Boolean): IXmlNode;

    normalize(): void;

    selectSingleNode(xpath: String): IXmlNode;

    selectNodes(xpath: String): XmlNodeList;

    selectSingleNodeNS(xpath: String, namespaces: Object): IXmlNode;

    selectNodesNS(xpath: String, namespaces: Object): XmlNodeList;

    getXml(): String;

  }

  export class XmlCDataSection {
    data: String;
    length: Number;
    prefix: Object;
    nodeValue: Object;
    firstChild: IXmlNode;
    lastChild: IXmlNode;
    localName: Object;
    namespaceUri: Object;
    nextSibling: IXmlNode;
    nodeName: String;
    nodeType: NodeType;
    attributes: XmlNamedNodeMap;
    ownerDocument: XmlDocument;
    childNodes: XmlNodeList;
    parentNode: IXmlNode;
    previousSibling: IXmlNode;
    innerText: String;
    constructor();

    splitText(offset: Number): IXmlText;

    substringData(offset: Number, count: Number): String;

    appendData(data: String): void;

    insertData(offset: Number, data: String): void;

    deleteData(offset: Number, count: Number): void;

    replaceData(offset: Number, count: Number, data: String): void;

    hasChildNodes(): Boolean;

    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    removeChild(childNode: IXmlNode): IXmlNode;

    appendChild(newChild: IXmlNode): IXmlNode;

    cloneNode(deep: Boolean): IXmlNode;

    normalize(): void;

    selectSingleNode(xpath: String): IXmlNode;

    selectNodes(xpath: String): XmlNodeList;

    selectSingleNodeNS(xpath: String, namespaces: Object): IXmlNode;

    selectNodesNS(xpath: String, namespaces: Object): XmlNodeList;

    getXml(): String;

  }

  export class XmlLoadSettings {
    validateOnParse: Boolean;
    resolveExternals: Boolean;
    prohibitDtd: Boolean;
    maxElementDepth: Number;
    elementContentWhiteSpace: Boolean;
    constructor();

  }

  export class DtdNotation {
    publicId: Object;
    systemId: Object;
    prefix: Object;
    nodeValue: Object;
    firstChild: IXmlNode;
    lastChild: IXmlNode;
    localName: Object;
    namespaceUri: Object;
    nextSibling: IXmlNode;
    nodeName: String;
    nodeType: NodeType;
    attributes: XmlNamedNodeMap;
    ownerDocument: XmlDocument;
    childNodes: XmlNodeList;
    parentNode: IXmlNode;
    previousSibling: IXmlNode;
    innerText: String;
    constructor();

    hasChildNodes(): Boolean;

    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    removeChild(childNode: IXmlNode): IXmlNode;

    appendChild(newChild: IXmlNode): IXmlNode;

    cloneNode(deep: Boolean): IXmlNode;

    normalize(): void;

    selectSingleNode(xpath: String): IXmlNode;

    selectNodes(xpath: String): XmlNodeList;

    selectSingleNodeNS(xpath: String, namespaces: Object): IXmlNode;

    selectNodesNS(xpath: String, namespaces: Object): XmlNodeList;

    getXml(): String;

  }

  export class DtdEntity {
    notationName: Object;
    publicId: Object;
    systemId: Object;
    prefix: Object;
    nodeValue: Object;
    firstChild: IXmlNode;
    lastChild: IXmlNode;
    localName: Object;
    namespaceUri: Object;
    nextSibling: IXmlNode;
    nodeName: String;
    nodeType: NodeType;
    attributes: XmlNamedNodeMap;
    ownerDocument: XmlDocument;
    childNodes: XmlNodeList;
    parentNode: IXmlNode;
    previousSibling: IXmlNode;
    innerText: String;
    constructor();

    hasChildNodes(): Boolean;

    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode;

    removeChild(childNode: IXmlNode): IXmlNode;

    appendChild(newChild: IXmlNode): IXmlNode;

    cloneNode(deep: Boolean): IXmlNode;

    normalize(): void;

    selectSingleNode(xpath: String): IXmlNode;

    selectNodes(xpath: String): XmlNodeList;

    selectSingleNodeNS(xpath: String, namespaces: Object): IXmlNode;

    selectNodesNS(xpath: String, namespaces: Object): XmlNodeList;

    getXml(): String;

  }

}



