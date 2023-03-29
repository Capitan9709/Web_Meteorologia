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

var direccionViento;

// muestra los datos de la peticion
function trataRespuesta() {
    let divDatos = document.getElementById("datosTiempo");
    let divDetalles = document.getElementById("detallesTiempo");
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            let respuesta = JSON.parse(httpRequest.responseText);
            console.log(respuesta);
            console.log("Numero de peticiones: "+contador);
            // div.innerHTML = "<table  class='border rounded'><tr class='border'><th class='border'>Temperatura</th><th class='border'>Velocidad del viento</th><th class='border'>Direccion del viento</th></tr><tr class='border'><td class='border'>"+respuesta.current_weather.temperature+" ºC</td><td class='border'>"+respuesta.current_weather.windspeed+" Km/h</td><td class='border'>"+respuesta.current_weather.winddirection+"º/360º</td></tr></table>";
            divDatos.innerHTML = "<h4>"+respuesta.elevation+" metros sobre el nivel del mar</h4><br>";
            divDatos.innerHTML += "<h4><i class='fa-duotone fa-temperature-list'></i> "+respuesta.current_weather.temperature+" ºC</h4><br>";
            if (respuesta.current_weather.winddirection >= 331 && respuesta.current_weather.winddirection <= 29) {
                direccionViento = "Norte";
            }
            else if (respuesta.current_weather.winddirection >= 30 && respuesta.current_weather.winddirection <= 69) {
                direccionViento = "Noreste";
            }
            else if (respuesta.current_weather.winddirection >= 70 && respuesta.current_weather.winddirection <= 109) {
                direccionViento = "Este";
            }
            else if (respuesta.current_weather.winddirection >= 110 && respuesta.current_weather.winddirection <= 149) {
                direccionViento = "Sureste";
            }
            else if(respuesta.current_weather.winddirection >= 150 && respuesta.current_weather.winddirection <= 210) {
                direccionViento = "Sur";
            }
            else if (respuesta.current_weather.winddirection >= 211 && respuesta.current_weather.winddirection <= 240) {
                direccionViento = "Suroeste";
            }
            else if (respuesta.current_weather.winddirection >= 241 && respuesta.current_weather.winddirection <= 300) {
                direccionViento = "Oeste";
            }
            else if (respuesta.current_weather.winddirection >= 301 && respuesta.current_weather.winddirection <= 330) {
                direccionViento = "Noroeste";
            }

            divDetalles.innerHTML = "<h4><i class='fa-solid fa-wind'></i> "+respuesta.current_weather.windspeed+" Km/h | Direccion: "+direccionViento+"</h4><br>";
            // divDetalles.innerHTML += "<h4>Direccion del viento: "+respuesta.current_weather.winddirection+"º/360º</h4><br>";
            if (respuesta.current_weather.weathercode == 0) {
                divDatos.innerHTML += "<img src='img/soleado.svg' alt='sol' class='img-fluid'>";
                divDatos.innerHTML += "<h4>Despejado</h4>";
            }
            else if (respuesta.current_weather.weathercode == 1) {
                divDatos.innerHTML += "<img src='img/nublado.svg' alt='nubes' class='img-fluid'>";
                divDatos.innerHTML += "<h4>Nublado</h4>";
            }
            else if (respuesta.current_weather.weathercode == 2) {
                divDatos.innerHTML += "<img src='img/lluvia.png' alt='lluvia' class='img-fluid'>";
                divDatos.innerHTML += "<h4>Lluvioso</h4>";
            }
            else if (respuesta.current_weather.weathercode == 3) {
                divDatos.innerHTML += "<img src='img/nieve.png' alt='nieve' class='img-fluid'>";
                divDatos.innerHTML += "<h4>Nevado</h4>";
            }
            else if (respuesta.current_weather.weathercode == 4) {
                divDatos.innerHTML += "<img src='img/tormenta.png' alt='tormenta' class='img-fluid'>";
                divDatos.innerHTML += "<h4>Tormentoso</h4>";
            }
            else if (respuesta.current_weather.weathercode == 5) {
                divDatos.innerHTML += "<img src='img/nubladolluvia.png' alt='nubladolluvia' class='img-fluid'>";
                divDatos.innerHTML += "<h4>Nublado con Lluvias</h4>";
            }
            else if (respuesta.current_weather.weathercode == 6) {
                divDatos.innerHTML += "<img src='img/nubladonieve.png' alt='nubladonieve' class='img-fluid'>";
                divDatos.innerHTML += "<h4>Nublado con Nevadas</h4>";
            }
            else if (respuesta.current_weather.weathercode == 7) {
                divDatos.innerHTML += "<img src='img/nubladotormenta.png' alt='nubladotormenta' class='img-fluid'>";
                divDatos.innerHTML += "<h4>Nublado con Tormentas</h4>";
            }
            else if (respuesta.current_weather.weathercode == 8) {
                divDatos.innerHTML += "<img src='img/nubladotormentalluvia.png' alt='nubladotormentalluvia' class='img-fluid'>";
                divDatos.innerHTML += "<h4>Nublado con Tormenta y Lluvias</h4>";
            }
            else if (respuesta.current_weather.weathercode == 9) {
                divDatos.innerHTML += "<img src='img/nubladotormentanieve.png' alt='nubladotormentanieve' class='img-fluid'>";
                divDatos.innerHTML += "<h4>Nublado con Tormenta y Nevadas</h4>";
            }
            else if (respuesta.current_weather.weathercode == 10) {
                divDatos.innerHTML += "<img src='img/nubladotormentagranizo.png' alt='nubladotormentagranizo' class='img-fluid'>";
                divDatos.innerHTML += "<h4>Nublado con Tormenta y Granizadas</h4>";
            }
            else {
                divDatos.innerHTML += "<h4>El tiempo es desconocido</h4>";
            }
            
            peticionEnCurso = false;
        } 
        else {
            alert("Hubo un problema con la petición.");
        }
    }
}