"use strict";
const StockModel = require("../models").Stock;
const bcrypt = require("bcrypt");

async function createStock(stock, like, ip) {
  const hashIP = bcrypt.hashSync(ip, 12);
  const newStock = new StockModel({
    symbol: stock,
    likes: like ? [hashIP] : [],
  });
  const saveNew = await newStock.save();
  return saveNew;
}

async function findStock(stock) {
  return await StockModel.findOne({ symbol: stock }).exec();
}

async function saveStock(stock, like, ip) {
  let saved = {};
  const foundStock = await findStock(stock);
  if (!foundStock) {
    const createSaved = await createStock(stock, like, ip);
    saved = createSaved;
    return saved;
  }
  if (like) {
    let isValid = false;
    for (let tmpIp of foundStock.likes) {
      isValid = bcrypt.compareSync(ip, tmpIp);
      if (isValid) {
        break;
      }
    }
    if (!isValid) {
      const hashIP = bcrypt.hashSync(ip, 12);
      foundStock.likes.push(hashIP);
    }
  }
  saved = await foundStock.save();
  return saved;
}
async function getStock(stock) {
  const res = await fetch(
    `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
  );
  const { symbol, latestPrice } = await res.json();
  return { symbol, latestPrice };
}

module.exports = function (app) {
  // https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/goog/quote
  app.route("/api/stock-prices").get(async function (req, res) {
    let ip = req.ip;
    const { stock, like } = req.query;
    if (Array.isArray(stock)) {
      // console.log("stocks: ", stock);

      const { symbol: symbol1, latestPrice: latestPrice1 } = await getStock(
        stock[0]
      );
      const { symbol: symbol2, latestPrice: latestPrice2 } = await getStock(
        stock[1]
      );

      const stock1 = await saveStock(stock[0], like, ip);
      const stock2 = await saveStock(stock[1], like, ip);

      let stockData = [];
      if (!symbol1) {
        stockData.push({
          rel_likes: stock1.likes.length - stock2.likes.length,
        });
      } else {
        stockData.push({
          stock: symbol1,
          price: latestPrice1,
          rel_likes: stock1.likes.length - stock2.likes.length,
        });
      }
      if (!symbol2) {
        stockData.push({
          rel_likes: stock2.likes.length - stock1.likes.length,
        });
      } else {
        stockData.push({
          stock: symbol2,
          price: latestPrice2,
          rel_likes: stock2.likes.length - stock1.likes.length,
        });
      }
      res.json({ stockData });
      return;
    }

    const { symbol, latestPrice } = await getStock(stock);
    if (!symbol) {
      res.json({ stockData: { likes: like ? 1 : 0 } });
      return;
    }
    const oneStockData = await saveStock(symbol, like, ip);
    // console.log("One stock data: ", oneStockData);

    let resJson = {
      stockData: {
        stock: symbol,
        price: latestPrice,
        likes: oneStockData.likes.length,
      },
    };
    res.json(resJson);
  });
};
