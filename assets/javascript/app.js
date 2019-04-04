(function($){
    $(function(){
   
      $('.sidenav').sidenav();
      $('.parallax').parallax();
   
    }); // end of document ready
   })(jQuery); // end of jQuery name space

   


$(document).ready(function () {

    var database = firebase.database();
    var holidaysData = database.ref("Countries");
    var holidayCountries;
    var year = "2019";
    var month = "04";
    var day = "26";
    var checkDate = year + "-" + month + "-" + day;
    var holidaysFound = [];
    console.log(advisories);
    
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
        //var prevUpcoming = "&previous=true";
        var prevUpcoming = "";

        for (i = 0; i < holidayCountries.length; i++) {
            var countryCode = holidayCountries[i].code;
            var countryName = holidayCountries[i].name;
            var queryCountry = "&country=" + countryCode;
            var queryURL = baseURL + apiKey + queryDate + prevUpcoming + queryCountry;
            holidayCall(queryURL, countryName, countryCode, function(allHolidaysInfo){
            })
        }

    }

        function holidayCall(queryString, country, code, callback) {
            $.ajax({
                url: queryString,
                method: "GET"
            }).done(function (data) {
                for (i = 0; i < data.holidays.length; i++) {

                    getWiki(data.holidays[i].name, country, function(wikiInfo) {

                    var riskLevel = advisories.advisorydata[code].situation.rating;

                    var holidayObject = {
                        "country": country,
                        "holiday": data.holidays[i].name,
                        "date": data.holidays[i].date,
                        "wiki-snippet": wikiInfo[0],
                        "wiki-link": wikiInfo[1],
                        "travel-risk": riskLevel
                    }
                    holidaysFound.push(holidayObject);

                    var newRow = $("<tr>");
                    var rowContent = "<td><img src='https://www.countryflags.io/" + code + "/flat/48.png'></td>";
                    rowContent += "<td>" + country + "</td>";
                    rowContent += "<td>" + data.holidays[i].date + "</td>";
                    rowContent += "<td>" + data.holidays[i].name + "</td>";
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
                    } else if (riskNumber > 4.5){
                        newColumn.addClass("extreme-risk");
                    }

                    newRow.append(newColumn);
                    $("#table-body").append(newRow);

                })
            }
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
        })

    }

    getCountriesList();





})