// Variables
const lap_history_div = document.getElementById("lap_history");
const actionButton1 = document.getElementById("actionButton1");
const actionButton2 = document.getElementById("actionButton2");

var timer;
var timerStartDate;
var timerCurrentDate;
var timerDelta = 0;
var timerPauseDate;
var timerSeconds = 0;

var currentLap = 1;
var remainingMeters = 0;


var settings = {
    race: "1500m",
    lapDistance: 400,
    partialLap: "FIRST",
    targetTime: 0
}

var race = {
    name: "",
    meters: 0,
    laps: 0,
    firstLapMeters: 0,
    lastLapMeters: 0
}

var laps = [
    {
        meters: 0,
        time: 0,
        split: 0,
        delta: 0,
        estimateTime: 0,
        targetSplit: 0,
        start: null,
        end: null,
        pause: 0     
    }
];


// Function to get the value of a cookie by name
function getCookie(name) {
    var cookieName = name + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return null;
}
  
// Function to set a cookie
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
    console.log("Saved cookie: " + document.cookie);
}

// Function to initialize an object from a cookie
function initializeObjectFromCookie(cookieName) {
    var cookieValue = getCookie(cookieName);
    if (cookieValue) {
        try {
            var object = JSON.parse(cookieValue);
            return object;
        } catch (error) {
            console.error("Error parsing cookie value as JSON:", error);
        }
    }
    return null;
}

// Function checks if the value is an integer and the remainder of dividing it by 1 is 0.  Returns a boolean.
function isWholeNumber(value) {
    return Number.isInteger(value) && value % 1 === 0;
}

// Function transforms seconds into minutes:seconds. Input is a number of seconds and output is formatted for time. Returns a string.
function formatTimeSeconds(totalSeconds) {
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);
    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

// Function to convert a number into a two digit string
function convertToTwoDigitString(number) {
    var str = number.toString();
  
    // Add a leading zero if the number is less than 10
    if (number < 10) {
        str = "0" + str;
    }
  
    return str;
}

function formatTimeMilli(milliseconds) {
    let totalSeconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(seconds).padStart(2, '0');
    let formattedMilliseconds = String(Math.round(milliseconds % 1000),2).padStart(3, '0');
    return `${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`;
}

function formatTime(milliseconds, includeMilliseconds = true) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
  
    if (includeMilliseconds) {
        const formattedMilliseconds = String(milliseconds % 1000).padStart(3, '0');
        return `${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`;
    } else {
        return `${formattedMinutes}:${formattedSeconds}`;
    }
}

// ###### Events ######
function start() {  
    timer = setInterval(function() {
        timerCurrentDate = new Date;
        timerDelta = timerCurrentDate - timerStartDate;
        
        // Account for any puase duration during all laps
        let timerPause = 0;
        for (let i = 0; i < laps.length; i++) {
            timerPause += laps[i].pause;
        }
        timerDelta = timerDelta - timerPause;

        // Display the overall time
        document.getElementById("time").innerText = formatTime(timerDelta);

        // Store the total seconds
        timerSeconds = timerDelta/1000;

        //Display current lap time
        let currentSplit = (timerCurrentDate - laps[currentLap - 1].start);
        currentSplit = currentSplit - laps[currentLap - 1].pause; //Account for any pause duration in the lap
        document.getElementById("lap_time").innerText = formatTime(currentSplit, false);
    }, 10);
    //Make this 10 for PROD

    //Update buttons to show Pause
    actionButton1.className = "pause";
    actionButton1.innerHTML = '<i class="fa-solid fa-pause"></i>';
    
    // Update actionButton2 to say Lap or Finish
    if (currentLap < race.laps) {
        actionButton2.className = "lap";
        actionButton2.innerText = "Lap";
    } else {
        actionButton2.className = "finish";
        actionButton2.innerText = "Finish";
    }
    actionButton2.style.display = "block";
    
    document.getElementById("splash_screen").style.display = "none"; //Hide options
}

function pause() {
    //Pause the timer
    clearInterval(timer);

    // Capture when the timer was paused
    timerPauseDate = new Date;

    actionButton1.className = "reset";
    actionButton1.innerHTML = '<i class="fa-solid fa-rotate"></i>';
    actionButton2.className = "resume";
    actionButton2.innerText = "Resume";
}

function addRelayHistory() {
    if ((settings.race == '4x800m') && 
            ((remainingMeters == 2400) || (remainingMeters == 1600) || (remainingMeters == 800) || (remainingMeters == 0))) {

        // Calculate the total time for the runner
        let relayLaps = 0
        if (settings.lapDistance == 400) {
            relayLaps = 2;
        } else {
            relayLaps = 4;
        }

        let relayTime = 0;
        for (let i = laps.length - relayLaps; i < laps.length; i++) {
            relayTime += laps[i].split;
        }
   
        //Create a new lap row in lap history table
        let lap_div = document.createElement("div");
        lap_div.className = "lap_div";
        lap_history_div.prepend(lap_div);

        //Display the runner number
        let lap_span = document.createElement("span");
        lap_span.className = "relay_runner";
        lap_span.innerText = "Runner " + (race.meters - remainingMeters) + "m";
        lap_div.appendChild(lap_span);

        //Display the runner total time
        lap_span = document.createElement("span");
        lap_span.className = "relay_time";
        lap_span.innerText = formatTimeSeconds(relayTime);
        lap_div.appendChild(lap_span);
    }
}

function addLapHistory() {
    //Create a new lap row in lap history table
    let lap_div = document.createElement("div");
    lap_div.className = "lap_div";
    lap_history_div.prepend(lap_div);

    //Display the lap number
    let lap_span = document.createElement("span");
    lap_span.className = "lap_num";
    lap_span.innerText = "Lap " + currentLap;
    lap_div.appendChild(lap_span);

    //Display the lap delta
    lap_span = document.createElement("span");
    if (currentLap == 1) {
        lap_span.className = "lap_delta_faster";
        lap_span.innerText = "";
    } else if (laps[currentLap - 1].delta <= 0) {
        lap_span.className = "lap_delta_faster";
        lap_span.innerText = laps[currentLap - 1].delta.toFixed(1) + "s";
    } else {
        lap_span.className = "lap_delta_slower";
        lap_span.innerText = "+" + laps[currentLap - 1].delta.toFixed(1) + "s";
    }
    lap_div.appendChild(lap_span);

    //Display the lap split
    lap_span = document.createElement("span");
    lap_span.className = "lap_split";
    lap_span.innerText = formatTimeSeconds(laps[currentLap - 1].split);
    lap_div.appendChild(lap_span);

    //Display the total time
    lap_span = document.createElement("span");
    lap_span.className = "lap_time";
    lap_span.innerText = formatTimeSeconds(laps[currentLap - 1].time);
    lap_div.appendChild(lap_span);
}

function calculateLapMetrics() {
    // Calculate lap split in seconds
    laps[currentLap - 1].split = (timerCurrentDate - laps[currentLap - 1].start)/1000;
    laps[currentLap - 1].split = laps[currentLap - 1].split - (laps[currentLap - 1].pause/1000); //Account for any pause time in lap
    
    // Store the total seconds as the time for this lap
    laps[currentLap - 1].time = timerSeconds;

    // Store the end timestamp
    laps[currentLap - 1].end = new Date;

    //Calculate the lap delta for all laps after the first lap      
    if (currentLap >= 2) {
        if (currentLap == 2) {
            laps[currentLap - 1].delta = laps[currentLap - 1].split - (laps[currentLap - 2].split * (settings.lapDistance/race.firstLapMeters));
        } else {
            laps[currentLap - 1].delta = laps[currentLap - 1].split - laps[currentLap - 2].split;
        }
    }  

    //Calculate the estimated finish time
    if (currentLap <= race.laps ) {
        if (currentLap == 1) {
            //The first lap is sometimes a partial lap, convert the time to a full lap
            laps[currentLap - 1].estimateTime = race.laps * (laps[currentLap - 1].split * (settings.lapDistance/race.firstLapMeters));
        } else {
            laps[currentLap - 1].estimateTime = laps[currentLap - 1].time + (laps[currentLap - 1].split * (race.laps - currentLap));
        }
    }

    // Calculate the distance of this lap
    if (currentLap == 1) {
        laps[currentLap - 1].meters = race.firstLapMeters;
    } else if (currentLap == race.laps) {
        laps[currentLap - 1].meters = race.lastLapMeters;
    } else {
        laps[currentLap - 1].meters = settings.lapDistance;
    }

    // Calculate the distance remaining
    let metersRun = 0;
    for (let i = 0; i < laps.length; i++) {
        metersRun += laps[i].meters;
    }
    remainingMeters = race.meters - metersRun;

    // Log all lap data
    console.log("------ Lap ------");
    console.log("currentLap: " + currentLap);
    console.log("remainingMeters: " + remainingMeters);
    console.log(laps[currentLap - 1]);
}


function lap() {    
    // Calculate lap metrics
    calculateLapMetrics();
    
    // Display lap stats
    addLapHistory();

    // Display Relay Runner stats
    addRelayHistory();

    // Update remaining meters
    document.getElementById("race_name").innerHTML = race.name + " | REMAINING: " + remainingMeters + "m";

    // Update estimated time
    document.getElementById("estimated_time").innerText = formatTimeSeconds(laps[currentLap - 1].estimateTime);
    
    // Update lap number
    document.getElementById("lap_header").innerText = "LAP " + (currentLap + 1) + " of " + race.laps;

    // Update label for actionButton2 to "Finish" for last lap
    if (currentLap == race.laps - 1) {
        actionButton2.innerText = "Finish";
        actionButton2.className = "finish";
    }  
    
    // Increase lap count
    currentLap++;

    // Initialize next lap values
    if (currentLap <= race.laps) {
        let nextLap = {
            meters: 0,
            time: 0,
            split: 0,
            delta: 0,
            estimateTime: 0,
            targetSplit: 0,
            start: new Date,
            end: null,
            pause: 0  
        };
        laps.push(nextLap);
    }

    // Update target lap pace
    updateTargetLapPace();
}

function finish() {
    // Calculate lap metrics
    calculateLapMetrics();

    // Display lap stats
    addLapHistory();

    // Display Relay Runner stats
    addRelayHistory();

    //Update remaining meters
    document.getElementById("race_name").innerHTML = race.name;

    actionButton1.className = "reset";
    actionButton1.innerHTML = '<i class="fa-solid fa-rotate"></i>';
    actionButton1.style = "background-color: #2e8ece;";
    actionButton2.disabled = true;
    clearInterval(timer);

    console.log("------ Finish ------");
    console.log(laps);
    saveLapHistory();
}

function reset() {
    //Reset and clear everything
    timerSeconds = 0;
    timerPause = 0;
    currentLap = 1;
    lap_history_div.innerHTML = "";

    document.getElementById("time").innerText = "00:00:000";
    document.getElementById("lap_time").innerText = "00:00";
    document.getElementById("estimated_time").innerText = "00:00";
    document.getElementById("race_name").innerHTML = race.name;
    document.getElementById("lap_header").innerText = "Lap 1 of " + race.laps;
    document.getElementById("splash_screen").style.display = "block"; // Display options

    actionButton1.innerText = "Start";  // Rename the start/resume button
    actionButton1.className = "start";
    actionButton2.disabled = false;
    actionButton1.style = null; // Clear any styles added
    actionButton2.style = null; // Clear any styles added
    actionButton2.style.display = "none"; // Hide the reset/lap button

    // Clear the laps[] object
    laps = [
        {
            meters: 0,
            time: 0,
            split: 0,
            delta: 0,
            estimateTime: 0,
            targetSplit: 0,
            start: null,
            end: null,
            pause: 0        
        }
    ];

    applySettings(); // Refresh race with settings for good measure
}

function updateTargetLapPace() {
    if (settings.targetTime > 0) {
        console.log("------ Calculating Target Lap Split ------");
        console.log("race.laps: " + race.laps);
        console.log("currentLap: " + currentLap);
        console.log("remainingMeters: " + remainingMeters);
        console.log("settings.targetTime: " + settings.targetTime);
        console.log("race.firstLapMeters: " + race.firstLapMeters);
        console.log("race.lastLapMeters: " + race.lastLapMeters);
        console.log("settings.lapDistance: " + settings.lapDistance);

        let deltaTargetTime = settings.targetTime - timerSeconds;
        console.log("deltaTargetTime: " + deltaTargetTime);
        
        let targetMeterPace = deltaTargetTime / remainingMeters;
        console.log("targetMeterPace: " + targetMeterPace);

        // Calculate the target pace for the current lap
        if (currentLap == 1) {
            //First Lap
            laps[currentLap - 1].targetSplit = targetMeterPace * race.firstLapMeters;
        } else if (currentLap == race.laps) {
            //Last lap
            laps[currentLap - 1].targetSplit = targetMeterPace * race.lastLapMeters;
        } else {
            //Not the first lap and not the last lap
            laps[currentLap - 1].targetSplit = targetMeterPace * settings.lapDistance;
        }

        console.log("laps[currentLap - 1].targetSplit: " + laps[currentLap - 1].targetSplit);

        document.getElementById("target_lap").innerText = formatTimeSeconds(laps[currentLap - 1].targetSplit);
        document.getElementById("target_time").innerHTML = formatTimeSeconds(settings.targetTime);
        document.getElementById("lap_time_grid").style.display = "grid";
        document.getElementById("estimated_time_grid").style.display = "grid";
        document.getElementById("target_lap").style.display = "flex";
        document.getElementById("target_lap_header").style.display = "flex";
        document.getElementById("target_time").style.display = "flex";
        document.getElementById("target_time_header").style.display = "flex";
        
    } else {
        document.getElementById("lap_time_grid").style.display = "block";
        document.getElementById("estimated_time_grid").style.display = "block";
        document.getElementById("target_lap").style.display = "none";
        document.getElementById("target_lap_header").style.display = "none";
        document.getElementById("target_time").style.display = "none";
        document.getElementById("target_time_header").style.display = "none";
    }
}

function applySettings() {        
    // Populate all variables based on the race selected
    switch (settings.race) {
        case '800m':
            race.name = '800 Meter';
            race.meters = 800;
            race.laps = 2;
            race.firstLapMeters = 400;
            race.lastLapMeters = 400;
            break;
        case '1500m':
            race.name = '1500 Meter';
            race.meters = 1500;
            race.laps = 4;
            race.firstLapMeters = 300;
            race.lastLapMeters = 400;
            break;
        case '1600m':
            race.name = '1600 Meter';
            race.meters = 1600;
            race.laps = 4;
            race.firstLapMeters = 400;
            race.lastLapMeters = 400;
            break;
        case '3000m':
            race.name = '3000 Meter';    
            race.meters = 3000;
            race.laps = 8;
            race.firstLapMeters = 300;
            race.lastLapMeters = 400;
            break;
        case '3200m':
            race.name = '3200 Meter';
            race.meters = 3200;
            race.laps = 8;
            race.firstLapMeters = 400;
            race.lastLapMeters = 400;
            break;
        case '4x800m':
            race.name = '4x800 Meter Relay';
            race.meters = 3200;
            race.laps = 8;
            race.firstLapMeters = 400;
            race.lastLapMeters = 400;
            break;
    }
    document.getElementById("race_name").innerHTML = race.name;

    // Initialize remainingMeters
    remainingMeters = race.meters;

    // Partial Lap: Swap the first and last lap meters
    if (settings.partialLap == "LAST") {
        let tempFirstLapMeters = race.firstLapMeters;
        race.firstLapMeters = race.lastLapMeters;
        race.lastLapMeters = tempFirstLapMeters;
    }

    // Lap Distance: Adjust for 200m laps
    if (settings.lapDistance == 200) {
        race.firstLapMeters = race.firstLapMeters - 200;
        race.lastLapMeters = race.lastLapMeters - 200;
        race.laps = race.laps * 2;
    }

    // Target Time: Estimate lap pace and display target time
    //document.getElementById("est_finish").innerHTML = "Estimated Finish";
    document.getElementById("lap_header").innerText = "LAP 1 of " + race.laps;
    updateTargetLapPace();

    // Save settings to cookie
    setCookie("settingsCookie", JSON.stringify(settings), 99);

    //Logging
    console.log("------ Settings Updated ------");
    console.log("settings.race: " + settings.race);
    console.log("settings.lapDistance: " + settings.lapDistance);
    console.log("settings.partialLap: " + settings.partialLap);
    console.log("settings.targetTime: " + settings.targetTime);
    console.log("race.name: " + race.name);
    console.log("race.meters: " + race.meters);
    console.log("race.laps: " + race.laps);
    console.log("race.firstLapMeters: " + race.firstLapMeters);
    console.log("race.lastLapMeters: " + race.lastLapMeters);
    console.log("remainingMeters: " + remainingMeters);
}

//Function to get the settings cookie and put the values into the settings object
function initializeSettingsFromCookie() {
    var retrievedSettings = initializeObjectFromCookie("settingsCookie");
    if (retrievedSettings) {
        settings = Object.assign(settings, retrievedSettings);
        console.log("Settings cookie found.  Loading saved settings...");
    } else {
        console.log("No settings cookie found!  Using default settings.");
    }
    console.log(settings);
    
    document.getElementById("settings_race").value = settings.race;
    document.getElementById("settings_lap_distance").value = settings.lapDistance;
    document.getElementById("settings_partial_lap").value = settings.partialLap;
}
initializeSettingsFromCookie();


// #################################
// ######## EVENT LISTENERS ########
// #################################

//Setting: Race
var settings_race = document.getElementById("settings_race");
settings_race.addEventListener("change", function() {
    settings.race = settings_race.options[settings_race.selectedIndex].value;
    applySettings();
});

//Setting: Lap Distance
var settings_lap_distance = document.getElementById("settings_lap_distance");
settings_lap_distance.addEventListener("change", function() {
    settings.lapDistance = Number(settings_lap_distance.options[settings_lap_distance.selectedIndex].value);
    applySettings();
});

//Setting: Partial Lap
var settings_partial_lap = document.getElementById("settings_partial_lap");
settings_partial_lap.addEventListener("change", function() {
    settings.partialLap = settings_partial_lap.options[settings_partial_lap.selectedIndex].value;
    applySettings();
});

//Setting: Target Time
document.addEventListener('DOMContentLoaded', function() {
    var minutesDropdown = document.getElementById('minutes');
    var secondsDropdown = document.getElementById('seconds');
    var setButton = document.getElementById('setButton');
    var clearButton = document.getElementById('clearButton');
  
    // Add options to minutes dropdown
    for (var i = 0; i <= 20; i++) {
      var option = document.createElement('option');
      option.text = i.toString().padStart(2, '0'); // Ensures two-digit format
      minutesDropdown.add(option);
    }
  
    // Add options to seconds dropdown
    for (var i = 0; i <= 59; i++) {
      var option = document.createElement('option');
      option.text = i.toString().padStart(2, '0'); // Ensures two-digit format
      secondsDropdown.add(option);
    }
  
    // Set default values
    minutesDropdown.value = convertToTwoDigitString(Math.floor(settings.targetTime / 60));
    secondsDropdown.value = convertToTwoDigitString(Math.round(settings.targetTime % 60));
  
    /* Event handler for set button
    setButton.addEventListener('click', function() {
      var selectedMinutes = minutesDropdown.value;
      var selectedSeconds = secondsDropdown.value;
      console.log('Target Time updated to:', selectedMinutes + ':' + selectedSeconds);
      settings.targetTime = (Number(selectedMinutes) * 60) + Number(selectedSeconds);
      applySettings();
    });
    */

    minutesDropdown.addEventListener('change', function() {
        var selectedMinutes = minutesDropdown.value;
        var selectedSeconds = secondsDropdown.value;
        console.log('Target Time updated to:', selectedMinutes + ':' + selectedSeconds);
        settings.targetTime = (Number(selectedMinutes) * 60) + Number(selectedSeconds);
        applySettings();
    });

    secondsDropdown.addEventListener('change', function() {
        var selectedMinutes = minutesDropdown.value;
        var selectedSeconds = secondsDropdown.value;
        console.log('Target Time updated to:', selectedMinutes + ':' + selectedSeconds);
        settings.targetTime = (Number(selectedMinutes) * 60) + Number(selectedSeconds);
        applySettings();
    });
  
    // Event handler for clear button
    clearButton.addEventListener('click', function() {
      minutesDropdown.value = "00";
      secondsDropdown.value = "00";
      settings.targetTime = 0;
      console.log('Target Time cleared');
      applySettings();
    });    
});
 
  
// Function to handle action buttons
function handleActionButton(event) {
    const selectedButton = event.target;
    console.log(`Action button ${selectedButton.className} was selected.`);
    
    switch (selectedButton.className) {
        case 'start':
            timerStartDate = new Date;  //Initial when race started
            laps[currentLap - 1].start = new Date(timerStartDate); //Initialize when lap started
            start();
            break;
        case 'pause': case 'fa-solid fa-pause':
            pause();
            break;
        case 'resume':
            let unpauseDate = new Date;    
            laps[currentLap - 1].pause += unpauseDate - timerPauseDate;
            start();
            break;
        case 'lap':
            lap();
            break;
        case 'finish':
            finish();
            break;
        case 'reset': case'fa-solid fa-rotate':
            reset();
            break;
    }
}
actionButton1.addEventListener("click", handleActionButton);
actionButton2.addEventListener("click", handleActionButton);

// Run applySettings() to get everything setup!
applySettings();



function getLocalStorage(key) {
    const valueString = localStorage.getItem(key);
    const value = [];

    // Check if the key has any value
    if (valueString != null) {
        const value = JSON.parse(valueString);
        console.log("Returning local storage value " + key);
        console.log(value);
    } else {
        console.log("No localStorage found for " + key);
    }
    return value;
}


function saveLocalStorage(key, value) {
    console.log("Saving local storage value " + key);
    console.log(value);
    var valueString = JSON.stringify(value);
    localStorage.setItem(key, valueString);
}


function saveLapHistory() {
    // Get the lapHistory from localStorage
    let raceHistory = [];
    raceHistory = getLocalStorage("raceHistory");

    // Build the new entry to save
    const newRaceEntry = {
        name: settings.race,
        meters: race.meters,
        laps: race.laps,
        time: timerDelta,
        lapData: laps
    }
    console.log("Adding newRaceEntry:");
    console.log(newRaceEntry);
    
    // Add the newRaceEntry to the raceHistory
    raceHistory.push(newRaceEntry);

    // Save the new raceHistory to local storage
    saveLocalStorage('raceHistory', raceHistory);
}


// This function displays a list of saved runs
function viewSavedRuns () {
    // Get history
    const lapHistory = getLocalStorage("lapHistory");
    const parent_div = document.getElementById("saved_runs");

    const currentHistory = Object.values(lapHistory);
    for (let i = 0; i < lapHistory.length; i++) {
        console.log('Array Item: ' + i);
        console.log("Label: " + lapHistory[i].label);
        console.log("start: " + lapHistory[i][0].start);
        console.log("Object Length: " + Object.keys(lapHistory[i]).length);
    }



    // Create a new row
    let div = document.createElement("div");
    div.className = "run_div";
    parent_div.prepend(div);

    //Display the run name
    let span = document.createElement("span");
    span.className = "run_label";
    span.innerText = "3200m @ 12/31 12:00 PM";
    div.appendChild(span);

    //Display the run time
    span = document.createElement("span");
    span.className = "run_time";
    span.innerText = "00:00";
    div.appendChild(span);
}
