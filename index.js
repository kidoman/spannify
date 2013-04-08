var Q = require("q")
  , _ = require("underscore")
  , jsdom = require("jsdom").jsdom

var Spannify = module.exports = function(opts) {
  this._opts = _.extend({
    className: "highlightableElement",
    idPrefix: "textHighlight",
    start: 0
  }, opts)
}

Spannify.prototype.end = function() {
  this._opts = null
}

Spannify.prototype.process = function(html) {
  var self = this
    , windowPromise = Q.ninvoke(jsdom, "env", { html: html })

  self._counter = self._opts.start

  return windowPromise
  .then(function(window) {
    var document = window.document
      , body = document.getElementsByTagName("body")[0]
      , nodesToVisit = []

    for(var i = 0; i < body.childNodes.length; i++) {
      nodesToVisit.push(body.childNodes[i])
    }

    while (nodesToVisit.length > 0) {
      var currentNode = nodesToVisit.shift()

      if (notHighlightable(currentNode)) {
        continue
      }

      if (isTextNode(currentNode)) {
        var replacementText = self._surroundWithSpans(currentNode.data)
          , replacementNode = createFragment(document, replacementText)
          , parentNode = currentNode.parentNode

        parentNode.replaceChild(replacementNode, currentNode)
      } else if (isElementNode(currentNode)) {
        for (var i = currentNode.childNodes.length - 1; i >= 0; i--) {
          nodesToVisit.unshift(currentNode.childNodes[i])
        }
      }
    }

    return document.innerHTML
  })
}

Spannify.prototype._surroundWithSpans = function(text) {
  var allWords = text.split(/\s/)
    , replacements = []
    , isStartingSpace
    , newText

  for (var wordCount = 0; wordCount < allWords.length; wordCount++) {
    if(wordCount === 0 && text.charAt(0) === " ") {
      newText = " " + allWords[wordCount]
      isStartingSpace = true
    } else {
      newText = allWords[wordCount]
      isStartingSpace = false
    }

    if ((text.match(/\s{2,1000}/g) === null || isStartingSpace) && newText.length === 0) {
      continue
    }

    replacements.push(this._createWrappedAnnotatableText(newText))

    if ((wordCount + 1) !== allWords.length || text[text.length - 1] === " ") {
      if (!wordCount || !isStartingSpace) {
        replacements.push(this._createWrappedAnnotatableText(" "))
      }
    }
  }

  return replacements.join("")
}

function notHighlightable(node) {
  return isIgnoreNodeId(node) || isXrefContent(node) || isIgnoredNodeType(node)
}

function isIgnoreNodeId(node) {
  return ["inlinetermTerm", "inlinedialog"].indexOf(node.id) > -1
}

function isXrefContent(node) {
  return !!node.id && node.id.indexOf("Xref_content") > -1
}

function isIgnoredNodeType(node) {
  return ["TITLE", "META", "SCRIPT", "STYLE", "LINK", "#comment"].indexOf(node.nodeName) > -1
}

function isTextNode(node) {
  return node.nodeType === 3
}

function isElementNode(node) {
  return node.nodeType === 1
}

Spannify.prototype._createWrappedAnnotatableText = function(text) {
  return ['<span id="', this._opts.idPrefix, "_", this._counter++, '" class="', this._opts.className, '">', text, "</span>"].join("")
}

function createFragment(document, html) {
  var frag = document.createDocumentFragment()
    , temp = document.createElement("div")

  temp.innerHTML = html

  while (temp.firstChild) {
    frag.appendChild(temp.firstChild)
  }

  return frag
}