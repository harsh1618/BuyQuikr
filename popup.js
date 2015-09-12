var secret = "0c2487f6740c0bf89b64a4827e07cbe2";

var date = '2015-09-13';
var appId = "541";
var email = "mohitashokgarg@gmail.com";

var productName = document.getElementsByTagName('h1')[0].innerHTML;
var productCategory = getElementByXpath('//*[@id="fk-mainbody-id"]/div/div[2]/div/div/div/ul/li[2]/a').innerHTML;

function numCommonWords(a, b) {
    var lista = a.split(" ");
    var listb = b.split(" ");
    arrays = [lista, listb];
    return arrays.shift().filter(function(v) {
        return arrays.every(function(a) {
            return a.indexOf(v) !== -1;
        });
    }).length;
}

function getElementByXpath(path) {
      return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function handleApiResponse() {
    var response = JSON.parse(this.response);
    var ads = response.AdsByCategoryResponse.AdsByCategoryData.docs;
    var best = 0;
    var maxScore = -1;
    for (var i = 0; i < ads.length; i++) {
        score = numCommonWords(productName, ads[i].title);
        if (score > maxScore) {
            maxScore = score;
            best = i;
        }
        console.log(ads[i].title + " " + score);
    }
    console.log(ads[best].title);
}

function getApiResponse(apiName, apiParams, token, tokenId) {
    var apiReq = new XMLHttpRequest();
    apiReq.open("GET", "https://api.quikr.com" + apiName + apiParams, true);
    apiReq.addEventListener("load", handleApiResponse);
    apiReq.setRequestHeader("X-Quikr-App-Id", appId);
    apiReq.setRequestHeader("X-Quikr-Token-Id", tokenId);

    var data = appId + apiName + date;
    var signature = CryptoJS.HmacSHA1(data, token).toString();

    apiReq.setRequestHeader("X-Quikr-Signature", signature);
    apiReq.send();
}

function handleTokenResponse() {
    var response = JSON.parse(this.response);
    var token = response['token'];
    var tokenId = response['tokenId'];

    var apiName = '/public/adsByCategory'; 
    var apiParams = '?categoryId=149&from=0&size=200';

    getApiResponse(apiName, apiParams, token, tokenId);
}

var data = email + appId + date;
var signature = CryptoJS.HmacSHA1(data, secret).toString();
var tokenReqJson = {"appId" : appId, "signature" : signature};

var tokenReq = new XMLHttpRequest();
tokenReq.open("POST", "https://api.quikr.com/app/auth/access_token", true);
tokenReq.addEventListener("load", handleTokenResponse);
tokenReq.setRequestHeader("Content-Type", "application/json");
tokenReq.send(JSON.stringify(tokenReqJson));

getElementByXpath('//*[@id="shortListDiv"]/a').style.backgroundColor = "#D2EDD2";
var img = '<img src="' + chrome.extension.getURL("quikr.png") + '" style="width:20px;height:20px;">';
getElementByXpath('//*[@id="shortListDiv"]/a/span[1]').innerHTML = img;
getElementByXpath('//*[@id="shortListDiv"]/a/span[1]').style.background = 'none';
getElementByXpath('//*[@id="shortListDiv"]/a/span[2]').innerHTML = 'BuyQuikr';
getElementByXpath('//*[@id="shortListDiv"]/a/span[2]').style.color = '#009900';
getElementByXpath('//*[@id="shortListDiv"]/a/span[3]').style.display = "none";
