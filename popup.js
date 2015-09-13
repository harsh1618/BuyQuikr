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
            return a.indexOf(v) !== -1 && v.length > 2;
        });
    }).length;
}

function getElementByXpath(path) {
      return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function updateSidebar() {
    getElementByXpath('//*[@id="shortListDiv"]/a').style.backgroundColor = "#D2EDD2";
    var img = '<img src="' + chrome.extension.getURL("quikr.png") + '" style="width:20px;height:20px;">';
    getElementByXpath('//*[@id="shortListDiv"]/a/span[1]').innerHTML = img;
    getElementByXpath('//*[@id="shortListDiv"]/a/span[1]').style.background = 'none';
    getElementByXpath('//*[@id="shortListDiv"]/a/span[2]').innerHTML = 'BuyQuikr';
    getElementByXpath('//*[@id="shortListDiv"]/a/span[2]').style.color = '#009900';
    getElementByXpath('//*[@id="shortListDiv"]/a/span[3]').style.display = "none";
    getElementByXpath('//*[@id="shortListDiv"]').style.right = "-203px";
    document.getElementsByClassName('mainContainer')[0].style.width = "200px";
    getElementByXpath('//*[@id="shortListDiv"]/div').innerText = "";
}

function addMap(ads) {
    var mapJson = {"type" : "FeatureCollection", "features" : []};
    var lat = '';
    var lon = '';
    for (var i = 0; i < 3; i++) {
        if (!ads[i].geo_pin) continue;
        lat = parseFloat(ads[i].geo_pin.split(",")[0]);
        lon = parseFloat(ads[i].geo_pin.split(",")[1]);
        var thisJson = {"type" : "Feature", "geometry" : {"type" : "Point", "coordinates" : [lon, lat]}, "properties" : {"name" : i.toString()}};
        mapJson.features.push(thisJson);
    }
    var mapUrl = encodeURI('https://api.mapbox.com/v4/mapbox.streets/geojson(' + JSON.stringify(mapJson) + ')/' + lon + ',' + lat + ',9/500x300.png?access_token=pk.eyJ1IjoibnV0cmlub2FudGkiLCJhIjoiY2llaWdtaXkyMDBrdnNybTFkZ2J2azZjdyJ9.X4Q7aMNwpwB03pG5ntOHsQ');

    var imgDiv = document.createElement('div');
    imgDiv.innerHTML = '<img src = "' + mapUrl + '" width="200px" height="200px">';
    getElementByXpath('//*[@id="shortListDiv"]/div').appendChild(imgDiv);
}

function createDiv(ad) {
    var adDiv = document.createElement('div');
    adDiv.style.marginBottom = "60px";
    if (ad.images[0] && ad.images[0].length > 10)
        imgUrl = ad.images[0];
    else
        imgUrl = chrome.extension.getURL("logo.jpg");
    if (ad.attribute_Price)
        price = '<p style="color:#e65c00">Rs ' + ad.attribute_Price + '</p>';
    else
        price = '';
    adDiv.innerHTML = '<a href="' + ad.url + '" target="_blank"><img src = "' + imgUrl + '" width="100px" height="100px"><br/>' + ad.title + '</a>' + price;
    getElementByXpath('//*[@id="shortListDiv"]/div').appendChild(adDiv);
}

function handleApiResponse() {
    updateSidebar();
    var response = JSON.parse(this.response);
    var ads = response.AdsByCategoryResponse.AdsByCategoryData.docs;
    for (var i = 0; i < ads.length; i++) {
        ads[i].score = numCommonWords(productName, ads[i].title);
    }
    ads.sort(function(a, b){return b.score - a.score;});

    for (var i = 0; i < 3; i++) {
        createDiv(ads[i]);
    }

    addMap(ads);
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

