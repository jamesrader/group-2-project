(function ($) {
    $(function () {

        $('.sidenav').sidenav();
        $('.parallax').parallax();

    }); // end of document ready
})(jQuery); // end of jQuery name space




$(document).ready(function () {

    var database = firebase.database();
    var holidaysData = database.ref("countries");
    var holidayCountries;
    var year = moment().format("YYYY");
    var month = moment().format("MM");
    var day = moment().format("DD");
    var today = moment().format("YYYY-MM-DD");
    var searchDay = today;
    var plusTwoYears = moment().add(2, "years").format("YYYY-MM-DD");
    var holidaysFound = [];
    var holidayWasFound = false;
    var countryCode = "";
    var count = 0;




    function getCountriesList() {
        holidaysData.once("value").then(function (snapshot) {

            //Get list of countries and country codes
            holidayCountries = snapshot.val();
            //console.log(holidayCountries);

            //Call function to get holiday data
            var allHolidaysInfo = getHolidays(month, day, year);
            //console.log(allHolidaysInfo);
        })
    }


    function getHolidays(m, d, y) {
        var baseURL = "https://holidayapi.com/v1/holidays";
        var apiKey = "?key=6f7ed797-29a5-47cc-85ff-049d4f9db221";
        var queryDate = "&month=" + m + "&day=" + d + "&year=" + y;
        //var prevUpcoming = "&upcoming=true";
        //var prevUpcoming = "";
        holidaysFound = [];
        count = 0;

        //Clear holiday table for new data
        $("#table-body").html("");

        //Loop through all countries and set up search
        for (i = 0; i < holidayCountries.length; i++) {
            countryCode = holidayCountries[i].code;
            var countryName = holidayCountries[i].name;
            var queryCountry = "&country=" + countryCode;
            var queryURL = baseURL + apiKey + queryDate + queryCountry;
            console.log(queryURL);

            //The call to search for holidays on specific date
            holidayCall(queryURL, countryName, countryCode, function (allHolidaysInfo) {
                count++;
                console.log(count);
                if (count === holidayCountries.length) {
                    console.log(holidaysFound);
                    console.log(holidaysFound.length);

                    //If no holidays are found on current search, add a day and search again
                    if (!holidayWasFound) {
                        searchDay = moment(searchDay).add(1, 'days');
                        console.log(moment(searchDay).format("YYYY-MM-DD"));
                        year = moment(searchDay).format("YYYY");
                        month = moment(searchDay).format("MM");
                        day = moment(searchDay).format("DD");
                        getHolidays(month, day, year);
                    }
                    holidayWasFound = false;
                }

            })
        }

        //console.log(holidaysFound);
        while (i < holidayCountries.length) {

        }
        if (holidaysFound.length === 0) {
            //console.log("No holidays found.");
        }

    }

    function holidayCall(queryString, country, code, callback) {
        $.ajax({
            url: queryString,
            method: "GET"
        }).done(function (data) {
            
            for (i = 0; i < data.holidays.length; i++) {
                holidayWasFound = true;
                //dataName.push(data.holidays[i].name);
                var dataDate = data.holidays[i].date;

                //getWiki(data.holidays[i].name, data.holidays[i].date, country, function (wikiInfo) {
                    getWiki(data.holidays[i].name, dataDate, country, function (wikiInfo) {

                    if (advisories.advisorydata.data[code]) {
                        var riskLevel = advisories.advisorydata.data[code].situation.rating;
                    } else {
                        var riskLevel = "No data.";
                    }


                        /* var holidayObject = {
                            "country": country,
                            "holiday": wikiInfo[2],
                            "date": wikiInfo[3],
                            "wiki-snippet": wikiInfo[0],
                            "wiki-link": wikiInfo[1],
                            "travel-risk": riskLevel
                        }
                        holidaysFound.push(holidayObject); */

                        var newRow = $("<tr>");
                        var rowContent = "<td><img src='https://www.countryflags.io/" + code + "/flat/48.png'></td>";
                        rowContent += "<td>" + country + "</td>";
                        /* rowContent += "<td>" + data.holidays[i].date + "</td>";
                        rowContent += "<td>" + data.holidays[i].name + "</td>"; */
                        rowContent += "<td>" + wikiInfo[3] + "</td>";
                        rowContent += "<td>" + wikiInfo[2] + "</td>";
                        rowContent += "<td><a href='" + wikiInfo[1] + "' target=blank>" + wikiInfo[0] + "</a></td>";
                        //rowContent += "<td>$" + flightCost + "</td>";
                        rowContent += "<td></td>";

                        var newColumn = $("<td id='" + code + "'>");
                        //code = code.slice(0,2);
                        console.log(code);
                        var columnContent = "<div>" + riskLevel + "</div>";
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

                        $("#" + code).mouseenter(function () {
                            //M.toast({html: "<iframe src='https://www.travel-advisory.info/widget-no-js?countrycode=NG' style='border:none; width:100%; height:250px;'>Country advisory by <a href='https://www.travel-advisory.info/'>https://www.travel-advisory.info</a></iframe>", classes: ""});
                            M.toast({ html: "<iframe src='https://www.travel-advisory.info/widget-no-js?countrycode=" + this.id + "' style='border:none; width:100%; height:250px;'>Country advisory by <a href='https://www.travel-advisory.info/'>https://www.travel-advisory.info</a></iframe>", classes: "test", displayLength: "30000" });
                        })

                        $("#" + code).mouseleave(function () {
                            M.Toast.dismissAll();
                        })
                    })
                    //callback(holidaysFound);
            }
            callback(holidaysFound);
            //If no holidays are found on current search, add a day and search again
            /* if (holidaysFound.length === 0) {
                searchDay = moment(searchDay).add(1, 'days');
                console.log(moment(searchDay).format("YYYY-MM-DD"));
                year = moment(searchDay).format("YYYY");
                month = moment(searchDay).format("MM");
                day = moment(searchDay).format("DD");
                getHolidays(month, day, year);
            }
 */
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
        searchDay = inputDate;

        if (inputDate < today || inputDate > plusTwoYears) {
            M.toast({ html: "Valid dates are ONLY between today and 2 years from today.", classes: " red rounded" });
        } else {

            year = moment(inputDate, "YYYY-MM-DD").format("YYYY");
            month = moment(inputDate, "YYYY-MM-DD").format("MM");
            day = moment(inputDate, "YYYY-MM-DD").format("DD");
            getHolidays(month, day, year);

        }

    })

    function getTravelAdvisories() {
        var baseURL = "https://cors-anywhere.herokuapp.com/";

        var queryString = "https://www.travel-advisory.info/api";

        $.ajax({
            url: baseURL + queryString,
            method: "GET"
        }).done(function (data) {
            console.log(data);
        })
    }



    function getFlightPrices(destCountry, holidayDate, callback) {

        //my api key a63a34e7f0fbe1a88d351460092f8aa3


        var country = "SYD";
        var date = "2019-04-01";
        var retDate = "2019-04-08";
        var token = "a63a34e7f0fbe1a88d351460092f8aa3";
        var myHome = "";
        var thisHome;
        var url;

        $.getJSON("https://www.travelpayouts.com/whereami?locale=en&callback=?", function (result) {

            myHome = result.iata;
            console.log(myHome);
            //thisHome = myHome;
        }).done(function (result) {
            console.log(myHome + "done")
            baseURL = "https://cors-anywhere.herokuapp.com/";
            //url = "https://api.travelpayouts.com/v2/prices/month-matrix?currency=usd&origin=NYC&destination=" + country + "&show_to_affiliates=true&depart_date=" + date + "&token=a63a34e7f0fbe1a88d351460092f8aa3";
            //url = "https://api.travelpayouts.com/v2/prices/latest?currency=usd&origin=" + myHome + "&destination=" + country + "&show_to_affiliates=true&depart_date=" + date + "&return_date=" + retDate + "&token=a63a34e7f0fbe1a88d351460092f8aa3";
            url = "https://min-prices.aviasales.ru/calendar_preload?origin=LAX&destination=LHR&depart_date=2019-05-01&one_way=false&currency=USD";
            console.log(url);

            $.get(url, function (data) {
                //response data are now in the result variable
                console.log(data);
                //var dollars = data.data[0].value;
                var dollars = data.current_depart_date_prices[6].value;
                var roundedDollars = Math.floor(dollars);
                //var dollars = Math.floor(parseInt(rubles) / 65.23);
                //console.log(rubles);
                //$("#price").text("$" + roundedDollars);

            }).done(function (resultb) {

                callback(roundedDollars);
                //alert(resultb);
                //JSON.parse(resultb);
                // console.log(resultb[0]);
                //var x = resultb;
                //console.log(x[0]);
                //JSON.parse(JSON.stringify(x));
                //console.log(x[0]);

            });


        });
    }

    getCountriesList();

    //getFlights();

    //getTravelAdvisories();



})