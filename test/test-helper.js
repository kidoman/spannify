var mocha = require("mocha")
  , chai = require("chai")
  , Spannify = require("../index")

require("mocha-as-promised")(mocha)
chai.should()
chai.use(require("chai-as-promised"))

module.exports = {
  Spannify: Spannify
}