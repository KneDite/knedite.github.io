var time = document.querySelector('.time');
var date = document.querySelector('.date');
var hijri = document.querySelector('.hijri-date');
var timeLeft = document.querySelector('.time-left');
var timeLeftText = document.querySelector('.time-left-text');
var infoText = document.querySelector('.infoText');
var infoMessage = document.querySelector('.infoMessage');
var dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
var hijriOptions = { day: '2-digit', month: '2-digit', year: 'numeric', calendar: 'islamic', timeZone: 'UTC' };
var options = { hourCycle: 'h23', hour12: false};
var currentTime = new Date();
var registeredDate;


Init();


function Init(){
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").then(registration => {
      console.log("SW Registered!");
      console.log(registration);
    }).catch(error => {
      console.log("SW Is Not Registered!");
      console.log(registration);
    })
  }

  fetch('status.php').then(response => response.json()).then(data => {
    if(data.power == 1){
      //News(data);
      DateAndTimes();
      setInterval(Time, 1000);
      ForceUpdate();
      $(".info").css("display", "none");
      $(".main").css("display", "flex");
    }
    else {
      $(".info > .loading").css("display", "none");
      $(".info > .infoMessage").css("display", "block");
      infoMessage.innerHTML = data.reason;
    }
  });
}

function News(data) {
  if (localStorage.getItem("newsVersion") == data.newsVersion) { return; }
  else if (localStorage.getItem("newsVersion") == null) { 
    localStorage.setItem("newsVersion", data.newsVersion);
    console.log("NULL");
  }
  localStorage.setItem("newsVersion", data.newsVersion);
  console.log("News Page!");
  //Show NewsPage
}

function Time() {
  currentTime = new Date();
  currentPrayTimes = Array();

  time.innerHTML = currentTime.toLocaleTimeString('en-US', options);

  for (let i = 0; i < 6; i++) {
    currentPrayTimes.push(document.getElementById("time-" + i).textContent);
    SetProperty(0, i);
  }

  for (let i = 0; i < 6; i++) {
    if (i == 0 && currentTime.toLocaleTimeString('en-US', options) < currentPrayTimes[i]) {
      if (currentTime.getHours() == 0) {
        TimeLeft("", true);
        break;
      }
      else {
        TimeLeft(currentPrayTimes[i], false);
        break;
      }
    }

    else if (i < 5 && i != 0 && currentTime.toLocaleTimeString('en-US', options) < currentPrayTimes[i]) {
      SetProperty(1, (i-1));
      TimeLeft(currentPrayTimes[i], false);
      break;
    }

    else if (i == 5) {
      if (currentTime.toLocaleTimeString('en-US', options) < currentPrayTimes[i]) {
        SetProperty(1, (i-1));
        TimeLeft(currentPrayTimes[i], false);
      }
      else {
        SetProperty(1, (i));
        TimeLeft(currentPrayTimes[i], true);
      }
      break;
    }
  }

  if (currentTime.getHours() != 0 && currentTime.getDate() > registeredDate) {
    DateAndTimes();
  }
  else if (currentTime.getHours() == 0 && (currentTime.getDate() - 1) != registeredDate) {
    DateAndTimes();
  }
}

function TimeLeft(nextTime, done) {
  let endPoint = new Date();

  if (done == true) {
    if (currentTime.getHours() > 1) {
      endPoint.setDate(currentTime.getDate() + 1);
      endPoint.setHours(1);
      endPoint.setMinutes(0);
      endPoint.setSeconds(0);
      timeLeftText.innerHTML = "Updating Times in...";
    } else if (currentTime.getHours() < 1 ) {
      endPoint.setHours(1);
      endPoint.setMinutes(0);
      endPoint.setSeconds(0);
      timeLeftText.innerHTML = "Updating Times in...";
    }
  }
  else {
    if (nextTime.split(':')[0] == 0) {
      endPoint.setDate(currentTime.getDate() + 1);
      endPoint.setHours(nextTime.split(':')[0]);
      endPoint.setMinutes(nextTime.split(':')[1]);
      endPoint.setSeconds(0);
      timeLeftText.innerHTML = "Time Left";
    }
    else {
      endPoint.setHours(nextTime.split(':')[0]);
      endPoint.setMinutes(nextTime.split(':')[1]);
      endPoint.setSeconds(0);
      timeLeftText.innerHTML = "Time Left";
    }
  }

  let timeDiff = endPoint.getTime() - currentTime.getTime();

  let hours = Math.floor(timeDiff / (1000 * 60 * 60));
  let minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  timeLeft.innerHTML = hours + ":" + minutes + ":" + seconds;
}

function SetProperty(mode, i) {
  if (mode == 1) {
    let element = document.getElementById("div-" + i);
    element.style.backgroundColor = "var(--blue)";
    element.children[0].style.color = "var(--white)";
    element.children[1].style.color = "var(--white)";
  }
  else {
    let element = document.getElementById("div-" + i);
    element.style.backgroundColor = "var(--field)";
  }
}

function DateAndTimes(){

  if (currentTime.getHours() == 0) { currentTime.setDate(currentTime.getDate() - 1) }
  
  registeredDate = currentTime.getDate();

  fetch('meta.json').then(response => response.json()).then(data => {
      for (let i = 0; i < 6; i++) {
        document.getElementById("time-" + i).innerHTML = data.times[currentTime.getMonth()][currentTime.getDate()][i];
      }
      date.innerHTML = currentTime.toLocaleDateString('en-US', dateOptions);
      let hijriDate = new Intl.DateTimeFormat('en-US-u-ca-islamic', hijriOptions).format(currentTime.setDate(currentTime.getDate())).replace(/\//g, '.').replace(/ AH/g, '').replace(/[^\d.]/g, '');
      //hijri.innerHTML = hijriDate;
    });
}


function ForceUpdate(){
  fetch('status.php').then(response => response.json()).then(data => {
    if (data.forceUpdate == 1) {
      infoText.innerHTML = "Force Updating in " + data.intervalBeforeFU + " Seconds...";
      setTimeout(function() {
        location.reload(true);
      }, (data.intervalBeforeFU * 1000));
    }
  });
}
