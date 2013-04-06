var helper = require('./test-helper')
  , Spannify = helper.Spannify

describe("Spannify", function() {
  describe("#process", function() {
    it("should surround text and white space with span tags", function() {
      var htmlPromise = new Spannify({ className: "a", idPrefix: "b" }).process("<html><body>This is so cool</body></html>")

      return htmlPromise.should.eventually.eql('<html><body><span id="b_0" class="a">This</span><span id="b_1" class="a"> </span><span id="b_2" class="a">is</span><span id="b_3" class="a"> </span><span id="b_4" class="a">so</span><span id="b_5" class="a"> </span><span id="b_6" class="a">cool</span></body></html>')
    })

    it("should traverse elements surrounded by text", function() {
      var htmlPromise = new Spannify({ className: "a", idPrefix: "b" }).process("<html><body>This is <em>so</em> cool</body></html>")

      return htmlPromise.should.eventually.eql('<html><body><span id="b_0" class="a">This</span><span id="b_1" class="a"> </span><span id="b_2" class="a">is</span><span id="b_3" class="a"> </span><em><span id="b_4" class="a">so</span></em><span id="b_5" class="a"> </span><span id="b_6" class="a"> </span><span id="b_7" class="a">cool</span></body></html>')
    })

    it("should not mess with non body nodes", function() {
      var htmlPromise = new Spannify({ className: "a", idPrefix: "b" }).process("<html><head><title>Hello</title></head><body></body></html>")

      return htmlPromise.should.eventually.eql("<html><head><title>Hello</title></head><body></body></html>")
    })

    it("should allow the index to be overridden to 1", function() {
      var htmlPromise = new Spannify({ className: "a", idPrefix: "b", start: 1 }).process("<html><body>Hi</body></html>")

      return htmlPromise.should.become('<html><body><span id="b_1" class="a">Hi</span></body></html>')
    })
  })
})