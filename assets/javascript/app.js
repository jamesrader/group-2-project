$(document).ready(function () {

    var database = firebase.database();
    var holidaysData = database.ref("Countries");
    var holidayCountries;
    var year = "2019";
    var month = "07";
    var day = "04";
    var checkDate = year + "-" + month + "-" + day;
    var holidaysFound = [];

    
    function getCountriesList() {
    holidaysData.once("value").then(function (snapshot) {
        //console.log(snapshot.val());
        holidayCountries = snapshot.val();
        console.log(holidayCountries);
        /* snapshot.forEach(function(childSnapshot){
            var data = childSnapshot.val();
            console.log(data);
            console.log("HERE!");
        }) */
        var allHolidaysInfo = getHolidays(month, day, year);
        console.log(allHolidaysInfo);
    })
}




    

    function getHolidays(m, d, y) {
        var baseURL = "https://holidayapi.com/v1/holidays";
        var apiKey = "?key=6f7ed797-29a5-47cc-85ff-049d4f9db221";
        var queryDate = "&month=" + m + "&day=" + d + "&year=" + y;
        //var prevUpcoming = "&previous=true";
        var prevUpcoming = "";
        /* var holidayCountries = [["US", "United States"],
        ["AO", "Angola"],
        ["AT", "Austria"],
        ["AU", "Australia"],
        ["AW", "Aruba"],
        ["AX", "Åland Islands"]
        ]; */

        for (i = 0; i < holidayCountries.length; i++) {
            //console.log(holidayCountries[i].code);
            var countryCode = holidayCountries[i].code;
            var countryName = holidayCountries[i].name;
            //console.log(countryCode);
            //console.log(countryName);
            var queryCountry = "&country=" + countryCode;
            var queryURL = baseURL + apiKey + queryDate + prevUpcoming + queryCountry;
            holidayCall(queryURL, countryName, function(allHolidaysInfo){
                console.log(allHolidaysInfo);
            })
        }

    }

        function holidayCall(queryString, country, callback) {
            //console.log("HERE!");
            $.ajax({
                url: queryString,
                method: "GET"
            }).done(function (data) {
                //return data;
                //console.log(country);
                //console.log(data);
                for (i = 0; i < data.holidays.length; i++) {

                    getWiki(data.holidays[i].name, country, function(wikiInfo) {

                    var holidayObject = {
                        "country": country,
                        "holiday": data.holidays[i].name,
                        "date": data.holidays[i].date,
                        "wiki-snippet": wikiInfo[0],
                        "wiki-link": wikiInfo[1]
                    }
                    holidaysFound.push(holidayObject);
                    /* console.log(country);
                    console.log(data.holidays[i]);
                    if (data.holidays[i].date === checkDate) {
                        console.log("ON EXACT DATE!");
                    } else {
                        console.log("Not on exact date.");
                    } */
                    //console.log(holidaysFound);
                })
            }
            //console.log(holidaysFound);
            callback(holidaysFound);

            })


        }

        


    function getWiki(searchHoliday, searchCountry, callback) {
        var baseURL = "https://en.wikipedia.org/w/api.php?action=query&list=search";
        var searchString = "&srsearch=" + searchHoliday + " " + searchCountry;
        var encodingAndFormat = "&utf8=&format=json&origin=*"
        var queryString = baseURL + searchString + encodingAndFormat;

        $.ajax({
            url: queryString,
            method: "GET"
        }).done(function (data) {

            console.log(data);
            if (data.query.search.length){
            var snippet = data.query.search[0].snippet;
            var pageid = data.query.search[0].pageid;
            } else {
                var snippet = "No data available.";
                var pageid = "No data available.";
            }
            console.log(data.query.search[0].snippet);
            console.log(data.query.search[0].pageid);
            var link = "https://en.wikipedia.org/?curid=" + pageid;
            var wikiData = [snippet, link];
            callback(wikiData);

            //RESULTING LINK = https://en.wikipedia.org/?curid=28790036 with id from API response.
        })

    }


    /* function getAdvisory (countryCode) {
        $("#widget-script").attr("src", "https://www.travel-advisory.info/widget.js?countrycode=" + countryCode);
        console.log(countryCode);
    
        var baseURL = "http://www.travel-advisory.info/api?countrycode=";
        var queryString = baseURL + countryCode;
        
        $.ajax({
             headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'},
             url: queryString,
            method: "GET"
        }).done(function(data) {
            
        console.log(data);
    
    })
    } */


    function getAdvisoryData() {
        //const proxyurl = "https://cors-anywhere.herokuapp.com/";
        var proxyurl = "http://cors.io/?";
        var baseURL = "http://www.reisewarnung.net/api";
        queryString = proxyurl + baseURL;
        $.ajax({
            url: baseURL,
            method: "GET",
            jsonp: "callback",
            dataType: "jsonp",
            contentType: "application/json"
            //headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token', 'Accept': 'application/json'}
        }).done(function (data) {

            console.log(data);
        })
    }
    //getHolidays(month, day, year);
    //getWiki("Groundhog Day", "United States");
    //getAdvisory("AU");
    //getAdvisoryData();
    getCountriesList();





})