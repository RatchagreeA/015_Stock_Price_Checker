const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { expect } = require("chai");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  this.timeout(5000);
  suite("GET request to /api/stock-prices/", () => {
    test("1: Viewing one stock", function (done) {
      let stock = "GOOG";
      let like = false;
      let expect = {
        stock: "GOOG",
        price: "GOOG has a price",
      };
      chai
        .request(server)
        .get("/api/stock-prices/")
        .set("content-type", "application/json")
        .query({ stock, like })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, expect.stock);
          assert.exists(res.body.stockData.price, expect.price);
          done();
        });
    });
    test("2: Viewing one stock and liking it", function (done) {
      let stock = "AAPL";
      let like = true;
      let expect = {
        stock: "AAPL",
        price: "AAPL has a price",
        like: 1,
      };
      chai
        .request(server)
        .get("/api/stock-prices/")
        .set("content-type", "application/json")
        .query({ stock, like })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, expect.stock);
          assert.exists(res.body.stockData.price, expect.price);
          assert.equal(res.body.stockData.likes, expect.like);
          done();
        });
    });
    test("3: Viewing the same stock and liking it again", function (done) {
      let stock = "AAPL";
      let like = true;
      let expect = {
        stock: "AAPL",
        price: "AAPL has a price",
        like: 1,
      };
      chai
        .request(server)
        .get("/api/stock-prices/")
        .set("content-type", "application/json")
        .query({ stock, like })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, expect.stock);
          assert.exists(res.body.stockData.price, expect.price);
          assert.equal(res.body.stockData.likes, expect.like);
          done();
        });
    });
    test("4: Viewing two stocks", function (done) {
      let stock = ["TSLA", "MSFT"];
      let like = false;
      let expect = [
        {
          stock: "TSLA",
          price: "TSLA has a price",
        },
        {
          stock: "MSFT",
          price: "MSFT has a price",
        },
      ];
      chai
        .request(server)
        .get("/api/stock-prices/")
        .set("content-type", "application/json")
        .query({ stock, like })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, expect[0].stock);
          assert.exists(res.body.stockData[0].price, expect[0].price);
          assert.equal(res.body.stockData[1].stock, expect[1].stock);
          assert.exists(res.body.stockData[1].price, expect[1].price);
          done();
        });
    });
    test("5: Viewing two stocks and liking them", function (done) {
      let stock = ["TSLA", "MSFT"];
      let like = true;
      let expect = [
        {
          stock: "TSLA",
          price: "TSLA has a price",
          rel_likes: "has rel_likes",
        },
        {
          stock: "MSFT",
          price: "MSFT has a price",
          rel_likes: "has rel_likes",
        },
      ];
      chai
        .request(server)
        .get("/api/stock-prices/")
        .set("content-type", "application/json")
        .query({ stock, like })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, expect[0].stock);
          assert.exists(res.body.stockData[0].price, expect[0].price);
          assert.exists(res.body.stockData[0].rel_likes, expect[0].rel_likes);
          assert.equal(res.body.stockData[1].stock, expect[1].stock);
          assert.exists(res.body.stockData[1].price, expect[1].price);
          assert.exists(res.body.stockData[1].rel_likes, expect[1].rel_likes);
          done();
        });
    });
  });
});
