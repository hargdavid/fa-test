var Chart = require('chart.js')

var roundToInt = function (numb) {
    return Math.round(Number(numb))
}

var convertToTWR = function (marketValue, purchaseValue) {
    return Math.round(((marketValue / purchaseValue) - 1) * 100) + '%'
}

var totalMarketValue = function (data) {
    var totalMarketValue = 0

    data.map(function (value) {
        totalMarketValue += Number(value.marketValue)
    })

    return roundToInt(totalMarketValue)
}

var totalTWRValue = function (data) {
    var totalMarketVal = 0
    var totalPurchaseVal = 0

    data.map(function (value) {
        totalMarketVal += Number(value.marketValue)
        totalPurchaseVal += Number(value.purchaseValue)
    })

    return convertToTWR(totalMarketVal, totalPurchaseVal)
}


var createRowHead = function (title) {
    return `<tr><th>${title}</th></tr>`
}

var createRow = function (data) {
    return `<tr>
   <td>${data.security}</td>
   <td>${data.type}</td>
   <td>${data.currency}</td>
   <td>${roundToInt(data.purchaseValue)}</td>
   <td>${roundToInt(data.marketValue)}</td>
   <td>${convertToTWR(data.marketValue, data.purchaseValue)}</td>
   </tr>`
}

var groupTableData = function (data) {
    var tableGroups = {}
    var returnString = ''

    data.map(function (value) {
        if (typeof tableGroups[value.type] !== 'undefined') {
            tableGroups[value.type].push(value)
        } else {
            tableGroups[value.type] = [value]
        }
    })

    Object.keys(tableGroups).forEach(key => {
        returnString += createRowHead(key)

        tableGroups[key].map(value => {
            returnString += createRow(value)
        })
    })

    return returnString
}

var toJson = function (data) {
    return JSON.stringify(data);
  }
