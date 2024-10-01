const user_tab = document.querySelector('.tab1')
const search_tab = document.querySelector('.tab2')

const grant_acces_screen = document.querySelector('.grant-acces-container')
const search_box = document.querySelector('.search-container')
const loading_screen = document.querySelector('.loading-screen-container')
const weather_detail_screen = document.querySelector('.weather-info-container')

var apiKey = '0613c8f5d224f30f85d7d6126f5220ab'
var currentTab = user_tab
currentTab.classList.add('currentTab')


getFromSessionStorage()

function switchTabs(new_tab) {
    currentTab.classList.remove('currentTab')
    currentTab = new_tab
    currentTab.classList.add('currentTab')

    if (currentTab===search_tab) {
        weather_detail_screen.classList.remove('active')
        grant_acces_screen.classList.remove('active')
        search_box.classList.add('active')
    }
    else{
        search_box.classList.remove('active')
        weather_detail_screen.classList.remove('active')
        
        getFromSessionStorage()
    }
}

function getFromSessionStorage() {
    let local_coordinates = sessionStorage.getItem('user_coordinates')
    console.log(local_coordinates)
    if (!local_coordinates){
        grant_acces_screen.classList.add('active')
    }
    else{
        console.log(local_coordinates)
        const coords = JSON.parse(local_coordinates)

        fetchUserWeatherInfo(coords)
    }
}

async function fetchUserWeatherInfo(coords){
    const {lati , longi} = coords

    grant_acces_screen.classList.remove('active')

    loading_screen.classList.add('active')
    
    try {
        let getUserData = await fetch(` https://api.openweathermap.org/data/2.5/weather?lat=${lati}&lon=${longi}&appid=${apiKey} `)
        let data = await getUserData.json()
        
        loading_screen.classList.remove('active')

        weather_detail_screen.classList.add('active')

        renderWeatherInfo(data)
    }

    catch (e) {
        weather_detail_screen.innerHTML = 'there is some problem , try in few minutes'
    }

}

function renderWeatherInfo(data) {

    let city_name = document.querySelector('.city-name')
    let country_flag = document.querySelector('.country-flag')
    let weather_type = document.querySelector('.weather-type')
    let weather_type_image = document.querySelector('.weather-type-image')
    let temperature_value = document.querySelector('.temperature-value')
    let windspeed_value = document.querySelector('.windspeed-value')
    let humidity_value = document.querySelector('.humidity-value')
    let clouds_value = document.querySelector('.clouds-value')

    city_name.textContent = data?.name    // optional chaining parameter to acces nested objets properties , it returns undefined if data not exist instead of throwing error = data?.property
    country_flag.src = `https://flagcdn.com/16x12/${data?.sys?.country.toLowerCase()}.png`
    weather_type.textContent =data?.weather?.[0]?.description
    weather_type_image.src = ` https://openweathermap.org/img/wn/${data?.weather?.[0]?.icon}.png `
    temperature_value.textContent = Math.floor(data?.main?.temp ) - 273+'°C'
    windspeed_value.textContent = data?.wind?.speed
    humidity_value.textContent = data?.main?.humidity
    clouds_value.textContent = data?.clouds?.all

}

function getUserPosition(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition)
    }
    else{
        weather_detail_screen.innerHTML = " Geolocation is not supported by this browser " ;
    }
}
function showPosition(position) {
    
    const userCoords = {
        lati : position.coords.latitude ,
        longi : position.coords.longitude 
    }

    sessionStorage.setItem('user_coordinates' , JSON.stringify(userCoords)) 
    fetchUserWeatherInfo(userCoords)
}

const grant_acces_button = document.querySelector('.grant-acces-button')

grant_acces_button.addEventListener('click' , getUserPosition)

user_tab.addEventListener('click', ()=> {
    switchTabs(user_tab)
})

search_tab.addEventListener('click', ()=> {
    switchTabs(search_tab)
})

const input_field = document.querySelector('.input-field')


search_box.addEventListener('submit' , (e)=> {
    e.preventDefault()
    var city_name= input_field.value ;
    
    if (city_name==='') {
        return
    }
    else{
       

        fetchSearchedUserWeatherInfo (city_name)
    }
})



async function fetchSearchedUserWeatherInfo(city_name) {
    loading_screen.classList.add('active')
    weather_detail_screen.classList.remove('active')
    grant_acces_screen.classList.remove('active')

    try {
       
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city_name}&appid=${apiKey}`)
       
        const result = await response.json()

        loading_screen.classList.remove('active')
        
        if (result.message === "city not found") {
            return ;
        }

        weather_detail_screen.classList.add('active')
    
        renderWeatherInfo(result)
    }
    catch (e) {
        console.log(e)
    }
}

