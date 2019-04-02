$(document).ready(function () {

    var database = firebase.database();
    var trainsData = database.ref("trains");



    function setup() {

        var nowDate = moment().format("MM/DD/YYYY");
        $("#first-date").val(nowDate);

        var nowUnix = moment().format("X");

        trainsData.on("value", function (snap) {

            $("#table-body").html("");
            getData(snap);
        });

        $("#date-check").on("click", function () {
            if ($("#first-date").is(":disabled")) {
                $("#first-date").prop("disabled", false);
            } else {
                $("#first-date").prop("disabled", true);
            }

        });


        function getData(snapshot) {
            snapshot.forEach(function (childSnapshot) {

                var data = childSnapshot.val();
                var newRow = $("<tr>");
                var newRowHTML = ("<td>" + data.train + "</td>");
                newRowHTML += ("<td>" + data.destination + "</td>");
                newRowHTML += ("<td>" + data.frequency + "</td>");

                var now = moment().format("HH:mm");

                var nowUnix = moment().format("X");
                var firstTimeUnix = moment(data.first, "X").format("X");
                var frequencySeconds = data.frequency * 60;

                if (firstTimeUnix > nowUnix) {
                    //var difference = firstTimeUnix - nowUnix;
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

                newRowHTML += ("<td>" + arrivalTime + "</td>");
                newRowHTML += ("<td>" + minutesAway + "</td>");
                newRow.append(newRowHTML);

                $("#table-body").append(newRow);

            })

        }

    }

    $("#submit-button").on("click", function (event) {

        event.preventDefault();

        var trainName = $("#train-name").val().trim();
        var trainDest = $("#destination").val().trim();
        var trainFirstTime = $("#first-time").val().trim();
        var trainFirstDate = $("#first-date").val().trim();
        var trainFreq = $("#frequency").val().trim();

        trainFirstDate = moment(trainFirstDate, "MM/DD/YYYY").format("YYYY-MM-DD");

        var trainFirstUnix = moment(trainFirstDate + "T" + trainFirstTime + ":00").format("X");

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

                var nowDate = moment().format("MM/DD/YYYY");
                $("#first-date").val(nowDate)
                    .prop("disabled", true);
            }
        });



        $(".form-control").on("focus", function () {
            $("#submit-message").text("");
        })


    });


    setup();


});