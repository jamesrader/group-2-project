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
    var wikiSnippet="";
    var wikiLink="";
    var wikiHoliday="";
    var wikiDate="";
    var countryCode = "";
    var count = 0;
    var roundedDollars="";
    var countryAirport="";
    var threeBack = moment().format("YYYY-MM-DD");
    var fourAhead = moment().format("YYYY-MM-DD");
    var yourLoaction = ""


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
            countryAirport = holidayCountries[i].airport;
            var queryCountry = "&country=" + countryCode;
            var queryURL = baseURL + apiKey + queryDate + queryCountry;

            //The call to search for holidays on specific date
            holidayCall(queryURL, countryName, countryCode, countryAirport, function (allHolidaysInfo) {
                count++;
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

    function holidayCall(queryString, country, code, searchAirport, callback) {
        var wikiArray=[];
        $.ajax({
            url: queryString,
            method: "GET"
        }).done(function (data) {
            console.log(data.holidays);
            console.log(data.holidays.length);
            for (i = 0; i < data.holidays.length; i++) {
                holidayWasFound = true;
                //dataName.push(data.holidays[i].name);
                var dataDate = data.holidays[i].date;

                

                console.log(i);
                //getWiki(data.holidays[i].name, data.holidays[i].date, country, function (wikiInfo) {
                    getWiki(data.holidays[i].name, dataDate, country, async function (wikiInfo) {

                        wikiSnippet = wikiInfo[0];
                        wikiLink = wikiInfo[1];
                        wikiHoliday = wikiInfo[2];
                        wikiDate = wikiInfo[3];


                        var wikiStuff = {
                            "country": country,
                            /* "holiday": data.holidays[i].name,
                            "date": data.holidays[i].date, */
                            "holiday": wikiInfo[2],
                            "date": wikiInfo[3],
                            "snippet": wikiInfo[0],
                            "link": wikiInfo[1]
                        }
                        wikiArray.push(wikiStuff);
                        
                    

                            getFlightPrices(searchAirport, dataDate, function(flightCost) {
                            buildObjectAndTable(flightCost);
                        })

                })
            
               

                    function buildObjectAndTable(flightPrice){
                        

                        if (advisories.advisorydata.data[code]) {
                            var riskLevel = advisories.advisorydata.data[code].situation.rating;
                        } else {
                            var riskLevel = "No data.";
                        }

                        

                        var newRow = $("<tr>");
                        var rowContent = "<td><img src='https://www.countryflags.io/" + code + "/flat/48.png'></td>";
                        rowContent += "<td>" + country + "</td>";
                        /* rowContent += "<td>" + data.holidays[i].date + "</td>";
                        rowContent += "<td>" + data.holidays[i].name + "</td>"; */
                        rowContent += "<td>" + wikiArray[0].date + "</td>";
                        rowContent += "<td>" + wikiArray[0].holiday + "</td>";
                        rowContent += "<td><a href='" + wikiArray[0].link + "' target=blank>" + wikiArray[0].snippet + "</a></td>";
                        
                        

                        //sky scanner link widget
                        var skyContent = $("<td id='" + searchAirport + "'>" + "Starting at: " + flightPrice + "</td>");
                        
                        var skyDiv = $("<div></div")
                        var scriptb = $("<script></script>")
                        scriptb.attr("src", "https://widgets.skyscanner.net/widget-server/js/loader.js")
                        skyDiv.attr("id","skyWidget")
                        skyDiv.attr("data-skyscanner-widget", "SearchWidget")
                        skyDiv.attr("data-locale","en-US");
                        skyDiv.attr("data-params","colour:cirrus");
                        skyDiv.attr("data-origin-iata-code", "'" +yourLoaction + "'");
                        skyDiv.attr("data-destination-iata-code","'" +searchAirport+ "'");
                        skyDiv.attr("data-flight-outbound-date",threeBack);
                        skyDiv.attr("data-flight-inbound-date",fourAhead);
                        skyDiv.attr("data-target","_blank");
                        skyDiv.attr("data-responsive","false");
                        skyDiv.attr("data-widget-scale",".5");
                        skyDiv.attr("data-button-text-size","1.5");
                        console.log(fourAhead + " four ahead");
                        console.log(threeBack + " three back");
                        skyContent.append(skyDiv);
                        skyContent.append(scriptb);
                                           
                        
                        
                        
                        //rowContent += "<td></td>";

                        var newColumn = $("<td id='" + code + "'>");
                        //code = code.slice(0,2);
                        //console.log(code);
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
                        
                        //add skyscanner widget to table
                        newRow.append(skyContent);
                        newRow.append(newColumn);
                        
                        $("#table-body").append(newRow);

                        $("#" + code).mouseenter(function () {
                            //M.toast({html: "<iframe src='https://www.travel-advisory.info/widget-no-js?countrycode=NG' style='border:none; width:100%; height:250px;'>Country advisory by <a href='https://www.travel-advisory.info/'>https://www.travel-advisory.info</a></iframe>", classes: ""});
                            M.toast({ html: "<iframe src='https://www.travel-advisory.info/widget-no-js?countrycode=" + this.id + "' style='border:none; width:100%; height:250px;'>Country advisory by <a href='https://www.travel-advisory.info/'>https://www.travel-advisory.info</a></iframe>", classes: "test", displayLength: "30000" });
                        })

                        $("#" + code).mouseleave(function () {
                            M.Toast.dismissAll();
                        })
                    }
                
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

    $("#date-search-button").on("click", function (event) {
        event.preventDefault();
        var inputDate = $("#date-enter").val();
        console.log(inputDate);
        
        //set fourAhead to input date
        fourAhead = inputDate;
        //add four days
        fourAhead = moment(fourAhead).add(4,'d').format('YYYY-MM-DD');
        //set three back to input date
        threeBack = inputDate;
        //subtract three days
        threeBack = moment(threeBack).subtract(3,'d').format('YYYY-MM-DD');
       
        // makes sure threeback didn't go back in time
        var now = moment();
        if (moment(now).isAfter(threeBack)){
            threeBack = inputDate;
            }

        if (inputDate < today || inputDate > plusTwoYears) {
            M.toast({ html: "Valid dates are ONLY between today and 2 years from today.", classes: " red rounded" });
        } else {

            year = moment(inputDate, "YYYY-MM-DD").format("YYYY");
            month = moment(inputDate, "YYYY-MM-DD").format("MM");
            day = moment(inputDate, "YYYY-MM-DD").format("DD");
            getHolidays(month, day, year);
            
            //var now = moment();
            


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



    function getFlightPrices(airport, holidayDate, callback) {

        //my api key a63a34e7f0fbe1a88d351460092f8aa3
        console.log(airport);

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
            yourLoaction = myHome;
            console.log(holidayDate);

            var departDate = moment(holidayDate, "YYYY-MM-DD").clone().subtract(3, 'days').format("YYYY-MM-DD");

            var baseURL = "https://cors-anywhere.herokuapp.com/";
            url = "https://min-prices.aviasales.ru/calendar_preload?origin=LAX&destination=" + airport + "&depart_date=" + departDate + "&one_way=false&currency=USD";
            //url = "https://api.travelpayouts.com/v2/prices/latest?currency=usd&period_type=year&page=1&origin=LAX&destination=AO&limit=30&show_to_affiliates=true&sorting=price&trip_class=0&token=b36f62c9e9a63ded46a8dd2d6622e8a8";
            //url = "https://api.travelpayouts.com/v2/prices/month-matrix?currency=usd&origin=LAX&destination=" + country + "&show_to_affiliates=true&depart_date=" + date + "&token=a63a34e7f0fbe1a88d351460092f8aa3";
            console.log(url);

            $.get(url, function (data) {
                //response data are now in the result variable
                console.log(data);
                //var dollars = data.data[0].value;
                if (data.current_depart_date_prices[6]){
                var dollars = data.current_depart_date_prices[6].value;
                roundedDollars = Math.floor(dollars);
                } else if (data.best_prices.length > 0) {
                    var total = 0;
                    for (i=0; i<data.best_prices.length; i++){
                        total += parseInt(data.best_prices[i].value);
                    }
                    roundedDollars = "$" + Math.floor(total / data.best_prices.length);
                } else {
                    roundedDollars = "No data.";
                }

            }).done(function (resultb) {

                callback(roundedDollars);

            });


        });
    }

    getCountriesList();

    //getFlights();

    //getTravelAdvisories();
 


})