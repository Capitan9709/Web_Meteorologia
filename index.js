window.onload = () => {
    getLocation();

    // se lanzan el resto de peticiones cada minuto 
    // para actualizar los datos
    window.setInterval(lanzarPeticion, 60000);

}

var peticionEnCurso = false;
var contador = 0;
var url;

// muestra la posicion del usuario
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
        console.log("Geolocation is supported by this browser.");
    } else {
        div.innerHTML = "Geolocation is not supported by this browser.";
    }
  }

// muestra la posicion del usuario
function showPosition(position) {
    latitud = document.getElementById("latitud");
    longitud = document.getElementById("longitud");
    // console.log("antes de innherHTML");
    latitud.innerHTML =  position.coords.latitude;
    longitud.innerHTML =  position.coords.longitude;
    // console.log("Latitud: "+latitud.innerHTML);
    // console.log("Longitud: "+longitud.innerHTML);
    
    getCity(position)

    crearUrl(latitud.innerHTML, longitud.innerHTML).then(lanzarPeticion);
    
}

// obtener la ciudad del usuario
function getCity(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    let url = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBt351dMXnP7LskzYpyeugrcX-OebFqkMM&latlng="+ lat + "," + lon +"&sensor=false";
    let httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", url);
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                let respuesta = JSON.parse(httpRequest.responseText);
                console.log(respuesta);
                let ciudad = respuesta.results[0].address_components[2].long_name;
                ciudad += ", " + respuesta.results[0].address_components[3].long_name;
                let div = document.getElementById("ciudad");
                div.innerHTML = ciudad;
            }
        }
    }
    httpRequest.send();
}



// muestra el error si no se puede obtener la posicion
function showError(error) {
    let div = document.getElementById("datosTiempo");
    switch(error.code) {
      case error.PERMISSION_DENIED:
        div.innerHTML = "<h2 class='text-danger fw-bolder'>Has denegado el uso de la Geolocalización.</h2>"
        // console.log("User denied the request for Geolocation.")
        break;
      case error.POSITION_UNAVAILABLE:
        div.innerHTML = "<h2 class='text-danger fw-bolder'>No se puede acceder a la localización.</h2>"
        break;
      case error.TIMEOUT:
        div.innerHTML = "<h2 class='text-danger fw-bolder'>Se ha excedido el tiempo necesario para obtener la localización del usuario.</h2>"
        break;
      case error.UNKNOWN_ERROR:
        div.innerHTML = "<h2 class='text-danger fw-bolder'>A ocurrido un error inesperado.</h2>"
        break;
    }
} 

// crar promesa para crear la url
function crearUrl(latitud, longitud){
    return new Promise((resolve, reject) => {
        url = `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m`;
        resolve();
    });
}

// lanza peticion de peliculas
function lanzarPeticion() {
    
    if(peticionEnCurso == false){

        // console.log("Peticion lanzada");
        contador++;
        peticionEnCurso = true;

        httpRequest = new XMLHttpRequest();
    
        httpRequest.open("GET", url);
        httpRequest.onreadystatechange = trataRespuesta;
        httpRequest.send();

    }
}

// muestra los datos de la peticion
function trataRespuesta() {
    let div = document.getElementById("datosTiempo");
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            let respuesta = JSON.parse(httpRequest.responseText);
            console.log(respuesta);
            console.log("Numero de peticiones: "+contador);
            // div.innerHTML = "<table  class='border rounded'><tr class='border'><th class='border'>Temperatura</th><th class='border'>Velocidad del viento</th><th class='border'>Direccion del viento</th></tr><tr class='border'><td class='border'>"+respuesta.current_weather.temperature+" ºC</td><td class='border'>"+respuesta.current_weather.windspeed+" Km/h</td><td class='border'>"+respuesta.current_weather.winddirection+"º/360º</td></tr></table>";
             
            div.innerHTML = "<h4>Temperatura: "+respuesta.current_weather.temperature+" ºC</h4><br>";
            div.innerHTML += "<h4>Velocidad del viento: "+respuesta.current_weather.windspeed+" Km/h</h4><br>";
            div.innerHTML += "<h4>Direccion del viento: "+respuesta.current_weather.winddirection+"º/360º</h4>";
            
            peticionEnCurso = false;
        } 
        else {
            alert("Hubo un problema con la petición.");
        }
    }
}