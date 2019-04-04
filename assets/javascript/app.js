(function ($) {
    $(function () {

        $('.sidenav').sidenav();
        $('.parallax').parallax();

    }); // end of document ready
})(jQuery); // end of jQuery name space




$(document).ready(function () {

    var database = firebase.database();
    var holidaysData = database.ref("Countries");
    var holidayCountries;
    var year = moment().format("YYYY");
    var month = moment().format("MM");
    var day = moment().format("DD");
    var today = moment().format("YYYY-MM-DD");
    var plusTwoYears = moment().add(2, "years").format("YYYY-MM-DD");
    var holidaysFound = [];
    
    


   

    function getCountriesList() {
        holidaysData.once("value").then(function (snapshot) {
            //console.log(snapshot.val());
            holidayCountries = snapshot.val();
            console.log(holidayCountries);
            var allHolidaysInfo = getHolidays(month, day, year);
            console.log(allHolidaysInfo);
        })
    }


    function getHolidays(m, d, y) {
        var baseURL = "https://holidayapi.com/v1/holidays";
        var apiKey = "?key=6f7ed797-29a5-47cc-85ff-049d4f9db221";
        var queryDate = "&month=" + m + "&day=" + d + "&year=" + y;
        //var prevUpcoming = "&upcoming=true";
        var prevUpcoming = "";

        $("#table-body").html("");

        for (i = 0; i < holidayCountries.length; i++) {
            var countryCode = holidayCountries[i].code;
            if (countryCode.length > 2) {
                countryCode = countryCode.slice(0, 2);
            }
            var countryName = holidayCountries[i].name;
            var queryCountry = "&country=" + countryCode;
            var queryURL = baseURL + apiKey + queryDate + queryCountry + prevUpcoming;
            holidayCall(queryURL, countryName, countryCode, function (allHolidaysInfo) {

            })
        }
        console.log(holidaysFound);

    }

    function holidayCall(queryString, country, code, callback) {
        $.ajax({
            url: queryString,
            method: "GET"
        }).done(function (data) {

            for (i = 0; i < data.holidays.length; i++) {

                //dataName.push(data.holidays[i].name);
                //var dataDate = data.holidays[i].date;

                getWiki(data.holidays[i].name, data.holidays[i].date, country, function (wikiInfo) {

                    if (advisories.advisorydata.data[code]) {
                        var riskLevel = advisories.advisorydata.data[code].situation.rating;
                    } else {
                        var riskLevel = "No data.";
                    }

                    var holidayObject = {
                        "country": country,
                        /* "holiday": data.holidays[i].name,
                        "date": data.holidays[i].date, */
                        "holiday": wikiInfo[2],
                        "date": wikiInfo[3],
                        "wiki-snippet": wikiInfo[0],
                        "wiki-link": wikiInfo[1],
                        "travel-risk": riskLevel
                    }
                    holidaysFound.push(holidayObject);

                    var newRow = $("<tr>");
                    var rowContent = "<td><img src='https://www.countryflags.io/" + code + "/flat/48.png'></td>";
                    rowContent += "<td>" + country + "</td>";
                    /* rowContent += "<td>" + data.holidays[i].date + "</td>";
                    rowContent += "<td>" + data.holidays[i].name + "</td>"; */
                    rowContent += "<td>" + wikiInfo[3] + "</td>";
                    rowContent += "<td>" + wikiInfo[2] + "</td>";
                    rowContent += "<td><a href='" + wikiInfo[1] + "' target=blank>" + wikiInfo[0] + "</a></td>";
                    rowContent += "<td></td>";

                    var newColumn = $("<td>");
                    var columnContent = riskLevel;
                    newColumn.append(columnContent);
                    //rowContent += "<td id='risk-" + code +"'>" + riskLevel + "</td>";

                    newRow.append(rowContent);

                    var riskNumber = parseFloat(riskLevel)

                    if (riskNumber < 2.5) {
                        newColumn.addClass("low-risk");
                    } else if (riskNumber >= 2.5 && riskNumber < 3.5) {
                        newColumn.addClass("medium-risk");
                    } else if (riskNumber >= 3.5 && riskNumber < 4.5) {
                        newColumn.addClass("high-risk");
                    } else if (riskNumber > 4.5) {
                        newColumn.addClass("extreme-risk");
                    }

                    newRow.append(newColumn);
                    $("#table-body").append(newRow);

                })
            }
            callback(holidaysFound);

        })


    }

    function getWiki(searchHoliday, searchDate, searchCountry, callback) {
        var baseURL = "https://en.wikipedia.org/w/api.php?action=query&list=search";
        var searchString = "&srsearch=" + searchHoliday + " " + searchCountry;
        var encodingAndFormat = "&utf8=&format=json&origin=*"
        var queryString = baseURL + searchString + encodingAndFormat;

        $.ajax({
            url: queryString,
            method: "GET"
        }).done(function (data) {

            console.log(data);
            if (data.query.search.length) {
                var snippet = data.query.search[0].snippet;
                var pageid = data.query.search[0].pageid;
            } else {
                var snippet = "No data available.";
                var pageid = "No data available.";
            }
            console.log(data.query.search[0].snippet);
            console.log(data.query.search[0].pageid);
            var link = "https://en.wikipedia.org/?curid=" + pageid;
            var wikiData = [snippet, link, searchHoliday, searchDate];
            callback(wikiData);
        })

    }

    function getFlights() {

        var baseURL = "https://cors-anywhere.herokuapp.com/https://api.travelpayouts.com/v1/prices/cheap?origin=LAX&destination=LHR&depart_date=2019-06&return_date=2019-07&currency=usd&token=b36f62c9e9a63ded46a8dd2d6622e8a8";
        $.ajax({
            url: baseURL,
            method: "GET",
            dataType: 'json',
            headers: {
                //"Access-Control-Allow-Origin": "*",
                //"Access-Control-Allow-Methods": "POST,GET",
                //"Access-Control-Allow-Headers": "Accept, Origin, Content-type",
                "X-Access-Token": "b36f62c9e9a63ded46a8dd2d6622e8a8"
            },
            contentType: 'application/json; charset=utf-8'
        }).done(function (data) {

            console.log(data);

        })

    }

    $("#date-search-button").on("click", function () {
        var inputDate = $("#date-enter").val();
        console.log(inputDate);

        if (inputDate < today || inputDate > plusTwoYears){
            M.toast({html: "Valid dates are ONLY between today and 2 years from today.", classes: " red rounded"});
        } else {

        

    
            year = moment(inputDate, "YYYY-MM-DD").format("YYYY");
            month = moment(inputDate, "YYYY-MM-DD").format("MM");
            day = moment(inputDate, "YYYY-MM-DD").format("DD");
            getHolidays(month, day, year);

       
        }



    })

    function getUpcoming() {
        var baseURL = "https://holidayapi.com/v1/holidays";
        var apiKey = "?key=6f7ed797-29a5-47cc-85ff-049d4f9db221";
        var queryDate = "&month=" + "04" + "&day=" + "08" + "&year=" + "2019";
        var prevUpcoming = "&upcoming=true";
        var queryCountry = "&country=US";
        var queryString = baseURL + apiKey + queryCountry + queryDate + prevUpcoming;

        $.ajax({
            url: queryString,
            method: "GET"
        }).done(function (data) {
            console.log(data);

            for (i = 0; i < data.holidays.length; i++) {
            }
        })
    }

    getCountriesList();

    //getFlights();

    //getUpcoming();



})