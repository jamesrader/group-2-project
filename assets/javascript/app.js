$(document).ready(function () {

    // Setup variables
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
    var wikiSnippet = "";
    var wikiLink = "";
    var wikiHoliday = "";
    var wikiDate = "";
    var countryCode = "";
    var count = 0;
    var roundedDollars = "";
    var countryAirport = "";
    var threeBack = moment().format("YYYY-MM-DD");
    var fourAhead = moment().format("YYYY-MM-DD");
    var yourLocation = ""

    //Get list of countries from Firebase
    function getCountriesList() {
        holidaysData.once("value").then(function (snapshot) {

            //Get list of countries and country codes
            holidayCountries = snapshot.val();

            //Call function to get holiday data
            var allHolidaysInfo = getHolidays(month, day, year);
        })
    }

    function getHolidays(m, d, y) {
        var baseURL = "https://holidayapi.com/v1/holidays";
        var apiKey = "?key=6f7ed797-29a5-47cc-85ff-049d4f9db221";
        var queryDate = "&month=" + m + "&day=" + d + "&year=" + y;

        //Reset any previous data
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

                    //If no holidays are found on current search, add a day and search again
                    if (!holidayWasFound) {
                        searchDay = moment(searchDay).add(1, 'days');
                        year = moment(searchDay).format("YYYY");
                        month = moment(searchDay).format("MM");
                        day = moment(searchDay).format("DD");
                        getHolidays(month, day, year);
                    }
                    holidayWasFound = false;
                }

            })
        }

    }

    //Search for holidays on certain date
    function holidayCall(queryString, country, code, searchAirport, callback) {
        var wikiArray = [];
        $.ajax({
            url: queryString,
            method: "GET"
        }).done(function (data) {

            for (i = 0; i < data.holidays.length; i++) {
                holidayWasFound = true;
                var dataDate = data.holidays[i].date;

                //Get data from wikipedia API
                getWiki(data.holidays[i].name, dataDate, country, async function (wikiInfo) {

                    wikiSnippet = wikiInfo[0];
                    wikiLink = wikiInfo[1];
                    wikiHoliday = wikiInfo[2];
                    wikiDate = wikiInfo[3];

                    //Create object with Wiki data.
                    var wikiStuff = {
                        "country": country,
                        "holiday": wikiInfo[2],
                        "date": wikiInfo[3],
                        "snippet": wikiInfo[0],
                        "link": wikiInfo[1]
                    }
                    wikiArray.push(wikiStuff);

                    //Call to get prices of flights
                    getFlightPrices(searchAirport, dataDate, function (flightCost) {

                        //Call to build the table
                        buildTable(flightCost);
                    })

                })

                function buildTable(flightPrice) {

                    if (advisories.advisorydata.data[code]) {
                        var riskLevel = advisories.advisorydata.data[code].situation.rating;
                    } else {
                        var riskLevel = "No data.";
                    }

                    var newRow = $("<tr>");
                    var rowContent = "<td><img src='https://www.countryflags.io/" + code + "/flat/48.png'></td>";
                    rowContent += "<td>" + country + "</td>";
                    rowContent += "<td>" + wikiArray[0].date + "</td>";
                    rowContent += "<td>" + wikiArray[0].holiday + "</td>";
                    rowContent += "<td><a href='" + wikiArray[0].link + "' target=blank>" + wikiArray[0].snippet + "</a></td>";

                    //set fourAhead to input date
                    fourAhead = moment(searchDay).format('YYYY-MM-DD');
                    //add four days
                    fourAhead = moment(fourAhead).add(4, 'days').format('YYYY-MM-DD');
                    //set three back to input date
                    threeBack = moment(searchDay).format('YYYY-MM-DD');
                    //subtract three days
                    threeBack = moment(threeBack).subtract(3, 'days').format('YYYY-MM-DD');

                    // makes sure threeback didn't go back in time
                    var now = moment();
                    if (moment(now).isAfter(threeBack)) {
                        threeBack = moment(searchDay).format('YYYY-MM-DD');
                        fourAhead = moment(searchDay).add(7, 'days').format('YYYY-MM-DD');
                    }

                    //Setup flight price column, including SkyScanner links
                    var skyContent = $("<td>");
                    var skyDiv = "<div class='flight-price' id='" + searchAirport + "'>" + "From: " + flightPrice + "</div>";
                    skyDiv += "<div><a href='https://www.skyscanner.com/transport/flights/" + yourLocation + "/" + searchAirport + "/" + threeBack + "/" + fourAhead + "' target='blank'><img src='assets/images/flight-search-button-small.png' alt='Search Flights'></a></div>";

                    //Put it all together
                    skyContent.append(skyDiv);
                    var newColumn = $("<td id='" + code + "'>");
                    var columnContent = "<div>" + riskLevel + "</div>";
                    newColumn.append(columnContent);
                    newRow.append(rowContent);
                    var riskNumber = parseFloat(riskLevel);

                    //Allow for color-coding of column background based on country's travel risk
                    if (riskNumber < 2.5) {
                        newColumn.addClass("low-risk");
                    } else if (riskNumber >= 2.5 && riskNumber < 3.5) {
                        newColumn.addClass("medium-risk");
                    } else if (riskNumber >= 3.5 && riskNumber < 4.5) {
                        newColumn.addClass("high-risk");
                    } else if (riskNumber > 4.5) {
                        newColumn.addClass("extreme-risk");
                    }

                    //Add all column data to table
                    newRow.append(skyContent);
                    newRow.append(newColumn);
                    $("#table-body").append(newRow);

                    //Setup rollover on risk column
                    $("#" + code).mouseenter(function () {
                        M.toast({ html: "<iframe src='https://www.travel-advisory.info/widget-no-js?countrycode=" + this.id + "' style='border:none; width:100%; height:250px;'>Country advisory by <a href='https://www.travel-advisory.info/'>https://www.travel-advisory.info</a></iframe>", classes: "advisory-container", displayLength: "30000" });
                    })
                    $("#" + code).mouseleave(function () {
                        M.Toast.dismissAll();
                    })
                }
            }
            callback(holidaysFound);
        })
    }

    //Get data from wikipedia
    function getWiki(searchHoliday, searchDate, searchCountry, callback) {
        var baseURL = "https://en.wikipedia.org/w/api.php?action=query&list=search";
        var searchString = "&srsearch=" + searchHoliday + " " + searchCountry;
        var encodingAndFormat = "&utf8=&format=json&origin=*"
        var queryString = baseURL + searchString + encodingAndFormat;

        $.ajax({
            url: queryString,
            method: "GET"
        }).done(function (data) {

            //Get snippet text and PageID for link
            if (data.query.search.length) {
                var snippet = data.query.search[0].snippet;
                var pageid = data.query.search[0].pageid;
            } else {
                var snippet = "No data available.";
                var pageid = "No data available.";
            }

            //Build link and send data back
            var link = "https://en.wikipedia.org/?curid=" + pageid;
            var wikiData = [snippet, link, searchHoliday, searchDate];
            callback(wikiData);
        })

    }

    //Main onClick function for search button
    $("#date-search-button").on("click", function (event) {

        //Don't allow form submission
        event.preventDefault();

        //Get date from input field, make sure value is valid
        var inputDate = $("#date-enter").val();
        if (inputDate < today || inputDate > plusTwoYears) {
            M.toast({ html: "Valid dates are ONLY between today and 2 years from today.", classes: " red rounded" });
        } else {
            year = moment(inputDate, "YYYY-MM-DD").format("YYYY");
            month = moment(inputDate, "YYYY-MM-DD").format("MM");
            day = moment(inputDate, "YYYY-MM-DD").format("DD");

            //Search for holidays
            getHolidays(month, day, year);
        }
    })

    function getFlightPrices(airport, holidayDate, callback) {

        var myHome = "";
        var url;

        //Find user's home airport
        $.getJSON("https://www.travelpayouts.com/whereami?locale=en&callback=?", function (result) {

            myHome = result.iata;

        }).done(function (result) {
            yourLocation = myHome;

            //Find actual day of departure for price info
            searchDay = holidayDate;
            var departDate = moment(holidayDate, "YYYY-MM-DD").clone().subtract(3, 'days').format("YYYY-MM-DD");

            //Add this base URL to fix CORS issues
            var baseURL = "https://cors-anywhere.herokuapp.com/";
            url = "https://min-prices.aviasales.ru/calendar_preload?origin=LAX&destination=" + airport + "&depart_date=" + departDate + "&one_way=false&currency=USD";

            $.get(url, function (data) {

                //If there is price info for departure date with return date one week later, return it
                if (data.current_depart_date_prices[6]) {
                    var dollars = data.current_depart_date_prices[6].value;
                    roundedDollars = Math.floor(dollars);
                } else if (data.best_prices.length > 0) {
                    
                //If not, then use average price of the "best prices" cateory 
                    var total = 0;
                    for (i = 0; i < data.best_prices.length; i++) {
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
    
    //Get it all started by getting the list of countries from Firebase
    getCountriesList();
})