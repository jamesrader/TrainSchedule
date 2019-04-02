$(document).ready(function () {
    //Setup database variables
    var database = firebase.database();
    var trainsData = database.ref("trains");

    function setup() {
        //Get current date for default form field
        var nowDate = moment().format("MM/DD/YYYY");
        $("#first-date").val(nowDate);

        //Get current unix timestamp for calculations
        var nowUnix = moment().format("X");

        //Listener for database changes
        trainsData.on("value", function (snap) {
            //Clear current table data
            $("#table-body").html("");
            getData(snap);
        });

        //Listener for change date button click
        $("#date-check").on("click", function () {
            if ($("#first-date").is(":disabled")) {
                $("#first-date").prop("disabled", false);
            } else {
                $("#first-date").prop("disabled", true);
            }

            //Clear a previous submit message
            $("#submit-message").text("");

        });

        //Function for getting data from database
        function getData(snapshot) {
            snapshot.forEach(function (childSnapshot) {

                //Start building a new table row for each train
                var data = childSnapshot.val();
                var newRow = $("<tr>");
                var newRowHTML = ("<td>" + data.train + "</td>");
                newRowHTML += ("<td>" + data.destination + "</td>");
                newRowHTML += ("<td>" + data.frequency + "</td>");

                //Next Arrival and Minutes Away calculations
                var now = moment().format("HH:mm");
                var nowUnix = moment().format("X");
                var firstTimeUnix = moment(data.first, "X").format("X");
                var frequencySeconds = data.frequency * 60;

                if (firstTimeUnix > nowUnix) {
                    var nextArrival = firstTimeUnix;
                } else {
                    var difference = nowUnix - firstTimeUnix;

                    if (difference < frequencySeconds) {
                        var nextArrival = nowUnix + difference;
                    } else {
                        var nextArrival = nowUnix - (difference % frequencySeconds) + frequencySeconds;
                    }
                }

                if (moment(nextArrival, "X").isSame(moment(nowUnix, "X"), "day")) {
                    var arrivalTime = moment(nextArrival, "X").format("hh:mm A");
                } else {
                    var arrivalTime = moment(nextArrival, "X").format("hh:mm A (MM/DD/YYYY)");
                }

                var difference = nextArrival - nowUnix;
                minutesAway = Math.floor(difference / 60);

                //Finish table rows
                newRowHTML += ("<td>" + arrivalTime + "</td>");
                newRowHTML += ("<td>" + minutesAway + "</td>");
                newRow.append(newRowHTML);

                //Add new row to the table
                $("#table-body").append(newRow);

            })

        }

    }

    //Listener for form submit button
    $("#submit-button").on("click", function (event) {

        event.preventDefault();

        //Store form field data in variables
        var trainName = $("#train-name").val().trim();
        var trainDest = $("#destination").val().trim();
        var trainFirstTime = $("#first-time").val().trim();
        var trainFirstDate = $("#first-date").val().trim();
        var trainFreq = $("#frequency").val().trim();

        //Data validation would be nice here!!!


        trainFirstDate = moment(trainFirstDate, "MM/DD/YYYY").format("YYYY-MM-DD");
        var trainFirstUnix = moment(trainFirstDate + "T" + trainFirstTime + ":00").format("X");

        //Send new data to database and set result message
        trainsData.push({
            train: trainName,
            destination: trainDest,
            first: trainFirstUnix,
            frequency: trainFreq
        }, function (error) {
            if (error) {
                $("#submit-message").text("Error. Please try again.")
                    .addClass("text-warning");
            } else {
                $("#submit-message").text("New data saved successfully.")
                    .addClass("text-success");
                $("#add-form")[0].reset();

                //Reset default form date to today's date
                var nowDate = moment().format("MM/DD/YYYY");
                $("#first-date").val(nowDate)
                    .prop("disabled", true);
            }
        });

        //Remove success/fail message on new form activity
        $(".form-control").on("focus", function () {
            $("#submit-message").text("");
        })

    });

    //Begin initial setup
    setup();

});