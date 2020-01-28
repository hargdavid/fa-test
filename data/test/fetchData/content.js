// -- DO NOT CHANGE -- Required Library & Function to make API call
const https = require("https");

const getThreeHighestAndThreeLowest = data => {
  let twrArr = [];

  data.map(value => {
    const objVal = {
      security: value.security,
      twr: Math.round((value.marketValue / value.purchaseValue - 1) * 100)
    };

    twrArr.push(objVal);
  });
  const sortedArr = twrArr.sort(function(a, b) {
    return a.twr - b.twr;
  });

  const firstThreeArr = sortedArr.slice(0, 3);

  const lastThreeArr = sortedArr.slice(Math.max(sortedArr.length - 3, 1));
  const highestValArr = lastThreeArr.reverse();

  return {
    highestThree: highestValArr,
    lowestThree: firstThreeArr
  };
};

const totalValuesInDifferentCurrencies = data => {
  let returnArr = [0, 0, 0];

  data.map(function(value) {
    switch (value.currency) {
      case "SEK":
        returnArr[0] += value.marketValue;
        break;
      case "EUR":
        returnArr[1] += value.marketValue;
        break;
      case "USD":
        returnArr[2] += value.marketValue;
        break;
      default:
    }
  });

  return returnArr;
};

const totalValueForCurrenciesInSecurityTypes = data => {
  let typeArr = [];
  let euroArr = [];
  let sekArr = [];
  let usdArr = [];

  data.map(function(value) {
    if (typeArr.indexOf(value.type) === -1) {
      typeArr.push(value.type);
    }

    const index = typeArr.indexOf(value.type);

    switch (value.currency) {
      case "SEK":
        if (typeof sekArr[index] !== "undefined") {
          sekArr[index] += Math.round(value.marketValue);
        } else {
          sekArr[index] = Math.round(value.marketValue);
        }
        break;
      case "EUR":
        if (typeof euroArr[index] !== "undefined") {
          euroArr[index] += Math.round(value.marketValue);
        } else {
          euroArr[index] = Math.round(value.marketValue);
        }
        break;
      case "USD":
        if (typeof usdArr[index] !== "undefined") {
          usdArr[index] += Math.round(value.marketValue);
        } else {
          usdArr[index] = Math.round(value.marketValue);
        }
        break;
      default:
    }
  });

  return {
    types: typeArr,
    sek: sekArr,
    eur: euroArr,
    usd: usdArr
  };
};

async function fetchData(reqURL, options) {
  return new Promise((resolve, reject) => {
    https.get(reqURL, options, result => {
      var str = "";
      result.on("data", b => (str += b));
      result.on("error", reject);
      result.on("end", () => resolve(str.length > 0 ? JSON.parse(str) : ""));
    });
  });
}
// This function runs before the report is made.
// All changes and data manipulation must be done here.
async function beforeRender(req, res) {
  // All parameters sent from FA can be accessed from "params"
  let params = req.data.params;
  /* Here, Add your own logic, variables or functions here to manipulate data
   before fetch */
  // Change endPoint to fetch from desired API URL
  const pfString = params["param-portfolioId"].join("%2C");
  const endPoint =
    "secure/fa/api/v1.0/overview/position/" +
    pfString +
    "?date=" +
    params["param-endDate"] +
    "&locale=" +
    params["param-language"];
  //const endPoint = "secure/fa/api/v1.0/overview/position/1092%2C313787%2C315676%2C315701%2C315763?date=2020-01-15&locale=en-US"
  const fetchMethod = "GET";
  // DO NOT CHANGE - Unless you wish to add headers or body
  const reqURL = params["param-apiUri"] + endPoint;
  const options = {
    method: fetchMethod,
    headers: {
      "fa-token-name": params["param-tokenName"],
      "fa-token-value": params["param-tokenValue"],
      Accept: "application/json"
    }
  };
  // In order to access something in JSReport Template, it should be saved in "req.data"
  // Storing the response from fetch function in "result" will allow template to read "result" object.
  const callData = await fetchData(reqURL, options);
  req.data.columns = callData.columns;
  req.data.rows = callData.rows;
  req.data.pieChartData = totalValuesInDifferentCurrencies(callData.rows);
  req.data.barChartData = totalValueForCurrenciesInSecurityTypes(callData.rows);
  req.data.twr = getThreeHighestAndThreeLowest(callData.rows);
}
