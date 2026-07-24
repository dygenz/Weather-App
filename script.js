let currentTemprature = document.querySelector("#temprature");
let currentCity = document.querySelector("#city");
let currentfeelsLike = document.querySelectorAll(".feel-like");
let currentHighTemp = document.querySelector(".highest-temprature span");
let currentLowTemp = document.querySelector(".lowest-temprature span");

let sky = document.querySelector("#sky-condition");
let button = document.querySelector(".search-icon");
let input = document.querySelector("#search-city");

let currentHumidity = document.querySelector("#humidity");
let currentWindSpeed = document.querySelector("#wind-speed");
let currentPressure = document.querySelector("#pressure");
let currentVisibility = document.querySelector("#visibility");
let sunRiseSet = document.querySelector("#sunriseset");
let greetings = document.querySelector(".greeting h2");
let greetingIcon = document.querySelector(".greeting svg");

let weatherIcon = document.querySelector(".weather-icon");
getWeather();

const now = new Date();
//Show greeting according to time
const currentTime = now.toLocaleTimeString("en-US" ,{hour12 : false});
if ("04:00:00" <= currentTime && currentTime <= "12:00:00") {
    greetings.innerText = "Good Morning";
} else if ("12:00:00" < currentTime &&  currentTime <= "16:00:00") {
    greetings.innerText = "Good Afternoon"
} else if ('16:00:00' < currentTime &&  currentTime <= "20:00:00"){
    greetings.innerText = "Good Evening";
    greetingIcon.setAttribute("href" , "icon.svg#icon-cloud-sun")
} else {
    greetings.innerText = "Good Night";
    greetingIcon.style.display = "none";
    document.body.style.background = "black";
}

async function getWeather() {

    const DEFAULT_CITY = "New Delhi , India"; // set a default country

    // when app opens show weather of a default city
    const city = input.value.trim() || DEFAULT_CITY;

    // when page loads show default city in the current city section 
    if(currentCity.innerHTML === "Current Location"){
        currentCity.innerHTML = DEFAULT_CITY;
    }
    if(!city) return;
    
    const apiKey = "d740aab0c696df8368f2ee4f692ba51e";

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
   
    //current temprature
    currentTemprature.textContent = Math.floor(data.main.temp);
    //today highest temprature
    currentHighTemp.textContent = Math.floor(data.main.temp_max);
    //today lowest temprature
    currentLowTemp.textContent = Math.floor(data.main.temp_min);
    // show sky condition of the area
    sky.textContent = data.weather[0].description;
    
    if (data.weather[0].main === "Clouds") {
        weatherIcon.setAttribute("href" , "icons.svg#icon-cloud-sun");
    } else if (data.weather[0].main === "Rain"){
        weatherIcon.setAttribute("href" , "icons.svg#icon-cloud-hail")
    } else {
        weatherIcon.setAttribute("href" , "icons.svg#sun-icon");
        weatherIcon.setAttribute("class" , "sun")
    }
    currentfeelsLike.forEach((feelLike)=>{
        feelLike.textContent = Math.floor(data.main.feels_like)
    })

    currentHumidity.textContent = `${data.main.humidity} %`;
    currentPressure.textContent =`${data.main.pressure} mb`;
    currentWindSpeed.textContent = `${Math.floor(data.wind.speed)} km/h`;
    currentVisibility.textContent = `${data.visibility /1000} km` ;

    const sunRise = new Date(data.sys.sunrise * 1000);
    let sunRiseTime = sunRise.toLocaleTimeString([],{
        hour: "2-digit",
        minute:"2-digit"
    });
    const sunSet = new Date(data.sys.sunset * 1000);
    let sunSetTIme = sunSet.toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit"
    })
    sunRiseSet.textContent = `${sunRiseTime} / ${sunSetTIme}`;

    // make search input empty after sucessfully showing weather of the city / area
    input.value = "";
    getForecast(city);
}

// show current temprature and other conditions when btn clicked
button.addEventListener("click", ()=>{
    getWeather();
})

// show weather when enter key is pressed
input.addEventListener("keydown",(event)=>{
    if (event.key === "Enter") {
        event.preventDefault();
        getWeather();
        suggestions.innerHTML = "";
    }
})

let suggestions = document.querySelector(".suggestions");

async function getInput() {
    const city = input.value.trim();

    // don't search if input is too short
    if (city.length <= 2) {
        suggestions.innerHTML = "";
        return;
    }
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=5&language=en&format=json`;

    const response = await fetch(url);
    const data = await response.json();

    //if nothing found than display "No results found" 
    if (!data.results){
        suggestions.innerHTML = `<div class="suggestion"> No results found </div>`;
        return;
    }

    // create a suggestion for every city
    data.results.forEach((place) => {
        
        let newSuggestion = document.createElement("div");
        newSuggestion.classList.add("suggestion");
        newSuggestion.textContent = 
        `${place.name} , ${place.admin1 ?? ""} , ${place.country}`
        suggestions.append(newSuggestion);

        // when user click on any suggestion , put the value into input and show weather of that city
        newSuggestion.addEventListener("click", () => {
            input.value = place.name;
            // show the current area into the current city section 
            currentCity.innerHTML = `${place.name} , ${place.admin1 ?? ""}`
            //when city is selected , clear suggestions and wait for next input
            suggestions.innerHTML = "";
            //show the weather of selected suggestion
            getWeather()
        })
    })
    
}
// any change in input call the getInput function
input.addEventListener("input", () => {
    getInput();   
})

// access temp and sky conditions for displaing forecast
let highTempForecast = document.querySelectorAll(".high-temprature");
let lowTempForecast = document.querySelectorAll(".low-temprature");
let skyForecat = document.querySelectorAll(".forecast-container span");
let forecastIcons = document.querySelectorAll(".forecast-weather-icon use");
let forecastDays = document.querySelectorAll(".forecast-container p");

async function getForecast(city) {
    const dayString = now.getDay();
    
    const days = ["Sun" ,"Mon" , "Tue" ,"Wed", "Thu" , "Fri" , "Sat"]
    forecastDays.forEach((day , index) => {
        day.innerText = days[(dayString + index + 1) % 7];
    });

    const apiKey = "d740aab0c696df8368f2ee4f692ba51e";
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`

    const response = await fetch(url);
    const data = await response.json();
    // making a new array to store 5 day forecast of 12 PM of each day
    const dailyForecast = [];
    data.list.forEach((item) => {
        let forecastData = item.dt_txt;
        // Take forecast of 12 PM for every day 
        if (forecastData.includes("12:00:00")) {
            dailyForecast.push(item);
        } 
    })
    dailyForecast.forEach((forecast , index) => {
        // highest and lowest temprature of 5 day forecast
        highTempForecast[index].innerText = Math.floor(forecast.main.temp_max);
        lowTempForecast[index].innerText =  Math.floor(forecast.main.temp_min);
        
        // changing forecast icons according to weather
        if (forecast.weather[0].main === "Clouds") {
            forecastIcons[index].setAttribute("href" , "icons.svg#icon-cloud-sun")
        } else if (forecast.weather[0].main === "Rain") {
            forecastIcons[index].setAttribute("href" , "icons.svg#icon-cloud-hail")
        } else {forecastIcons[index].setAttribute("href" , "icons.svg#sun-icon");
            forecastIcons[index].setAttribute("class" , "sun")
        }
        skyForecat[index].innerText = forecast.weather[0].description;
    })
}

// Change mode if the the button clicked
let themeChange = document.querySelector(".nav-icon-container");

themeChange.addEventListener("click" , () => {
    if(document.body.style.background === "black"){
        document.body.style.background = ""
    } else {document.body.style.background = "black"}
})