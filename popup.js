//function renderStatus(statusText) {
//  document.getElementById('status').textContent = statusText;
//}
//
//document.addEventListener('DOMContentLoaded', function() {
//  getCurrentTabUrl(function(url) {
//    // Put the image URL in Google search.
//    renderStatus('Performing Google Image search for ' + url);
//
//    getImageUrl(url, function(imageUrl, width, height) {
//
//      renderStatus('Search term: ' + url + '\n' +
//          'Google image search result: ' + imageUrl);
//      var imageResult = document.getElementById('image-result');
//      // Explicitly set the width/height to minimize the number of reflows. For
//      // a single image, this does not matter, but if you're going to embed
//      // multiple external images in your page, then the absence of width/height
//      // attributes causes the popup to resize multiple times.
//      imageResult.width = width;
//      imageResult.height = height;
//      imageResult.src = imageUrl;
//      imageResult.hidden = false;
//
//    }, function(errorMessage) {
//      renderStatus('Cannot display image. ' + errorMessage);
//    });
//  });
//});

var token = '';
var tokenId = '';

var productName = document.getElementsByTagName('h1')[0].innerHTML;
var productCategory = getElementByXpath('//*[@id="fk-mainbody-id"]/div/div[2]/div/div/div/ul/li[2]/a').innerHTML;

function getElementByXpath(path) {
      return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function getApiResponse(apiName, apiParams, token, tokenId) {
    var apiReq = new XMLHttpRequest();
    apiReq.open("GET", "https://api.quikr.com" + apiName + apiParams, false);
    apiReq.setRequestHeader("X-Quikr-App-Id", "541");
    apiReq.setRequestHeader("X-Quikr-Token-Id", tokenId);

    var data = "541" + apiName + "2015-09-13";
    var signature = CryptoJS.HmacSHA1(data, token).toString();

    apiReq.setRequestHeader("X-Quikr-Signature", signature);
    apiReq.send();
    return apiReq.response;
}

function handleTokenResponse() {
    var response = JSON.parse(this.response);
    token = response['token'];
    tokenId = response['tokenId'];
    console.log(token);
    console.log(tokenId);
    var apiName = '/public/adsByCategory'; 
    var apiParams = '?categoryId=149&from=0&size=20';
    console.log(getApiResponse(apiName, apiParams, token, tokenId));
}

var secret = "0c2487f6740c0bf89b64a4827e07cbe2";

var data = "mohitashokgarg@gmail.com" + "541" + "2015-09-13";
var signature = CryptoJS.HmacSHA1(data, secret).toString();
var tokenReqJson = {"appId" : "541", "signature" : signature};

var tokenReq = new XMLHttpRequest();
tokenReq.open("POST", "https://api.quikr.com/app/auth/access_token", true);
tokenReq.addEventListener("load", handleTokenResponse);
tokenReq.setRequestHeader("Content-Type", "application/json");
tokenReq.send(JSON.stringify(tokenReqJson));

//var categoryReq = new XMLHttpRequest();
//categoryReq.open("GET", "https://api.quikr.com/public/adsByCategory?categoryId=149&from=0&size=20", true);
//categoryReq.send();
//console.log(categoryReq.responseText);

