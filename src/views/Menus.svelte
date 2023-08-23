<script>
  //Nos suscribimos a las stores
  import { menuStore, getMenu } from "../stores/Menu";

  //importamos onMount para que se ejecute cuando se monte el componente
  import { onDestroy, onMount } from "svelte";

  //importamos lo necesario para comunicar con la base de datos
  import { db } from "../firebase";
  import {
    addDoc,
    collection,
    onSnapshot,
    updateDoc,
    doc,
  } from "firebase/firestore";

  let restaurante = {
    idRestaurante: 0,
    img: "https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Restaurantes%2Fnot-found-icon-4.jpg?alt=media&token=5b0a8e01-c4b6-4218-8983-bbc4648cbf67",
    nombre: "ejemplo",
    direccion: "",
    telefono: 0,
    horaApertura: "",
    horaCierre: "",
    descripcion: "",
    puntuacion: 5.0,
    visible: true,
  };

  //traemos el menu guardado
  onMount(async () => {
    //obtenemos el evento
    console.log("este");
    menuStore.subscribe((value) => {
      restaurante = value;
      console.log(restaurante.nombre);
      if (restaurante == null) {
        console.log("No hay evento");
      }
    });
  });

  //Traemos la base de datos de Menus
  //creamos una variable para guardar los menus
  let menus = [];

  // VARIABLES PARA CALIFICACION DE RESTAURANTE
  let selectedRating = null;
  let reviewText = "";
  

  const unsub = onSnapshot(
    collection(db, "Menus"),
    (querySnapshot) => {
      menus = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });

      menus = menus.filter((menu) => {
        return menu.idRestaurante == restaurante.idRestaurante;
      });

      console.log(menus);
    },
    (error) => {
      console.log(error);
    }
  );

  onDestroy(() => {
    unsub();
  });

  //Funciones para calaificar un menu
  //Variable para saber cuando se esta calificando un menu
  let calificando = false;
  const mostrarMenuCalificacion = () => {
    calificando = !calificando;
  };

let calificado = false;
const restauranteCalificado = () => {
    calificado = !calificado;
  };

 
</script>
<div class="menus">
  <!-- <h1>Menu's</h1>
  <h1>{restaurante.nombre}</h1> -->

  {#each menus as menu}
    <div class="menu-card">
      <img class="menu-image" src={menu.imagen} alt="Imagen del Menu" />
      <div class="menu-details">
        <h1 class="menu-name">{menu.nombre}</h1>
        <h1 class="menu-description">{menu.descripcion}</h1>
        <h1 class="menu-price">$ {menu.precio}</h1>
      </div>
    </div>
  {/each}
</div>


<div class="button-container">
  {#if !calificado}
  {#if !calificando }
  <button class="custom-button" on:click={mostrarMenuCalificacion} >Calificar Restaurante</button>
{:else}
<div class="center">
<div class="form-container">
  <div class="stars-container">
    <div class="stars">
      <input type="radio" id="five" name="rate" value="5" bind:group={selectedRating}>
      <label for="five"></label>
      <input type="radio" id="four" name="rate" value="4" bind:group={selectedRating}>
      <label for="four"></label>
      <input type="radio" id="three" name="rate" value="3" bind:group={selectedRating}>
      <label for="three"></label>
      <input type="radio" id="two" name="rate" value="2" bind:group={selectedRating}>
      <label for="two"></label>
      <input type="radio" id="one" name="rate" value="1" bind:group={selectedRating}>
      <label for="one"></label>
      <span class="result"></span>
    </div>
  </div>

  <div class="text-input">
    <label for="review">Ingresa tu opinión:</label>
    <textarea id="review" name="review" rows="4" cols="50" bind:value={reviewText}></textarea>
  </div>
</div>
</div>

  <div class="button-container-before">
    <button class="custom-button" on:click={mostrarMenuCalificacion, restauranteCalificado} >Enviar calificación</button>
  </div>
{/if}  
  {:else}
   <h1 >Gracias por tu Calificación!</h1>
  {/if}
  
</div>

<style>
  *{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.text-input {
  margin-left: 100px;
}

.button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .button-container-before {
    display: flex;
    justify-content: center;
    align-items: left ;
    margin-top: 500px;
    margin-bottom: 20px;
  }

  .custom-button {
    background-color: #FFAC30; /* Color de fondo naranja oscuro */
    color: #ffffff; /* Color de texto blanco */
    font-weight: bold; /* Fuente en negrita */
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .custom-button:hover {
    background-color: #FFC654; /* Color de fondo naranja claro al pasar el cursor */
  }
  .center {
    display: flex;
    justify-content: center;
    background-color: #ffffff; /* Color amarillo pálido */
    padding: 20px;
  }

  .form-container {
    background-color: rgba(255, 255, 255, 0.8); /* Fondo blanco semi-transparente */
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
    margin-bottom: 0;
  }
.center .stars{
  height: 150px;
  width: 500px;
  text-align: center;
}
.stars input{
  display: none;
}
.stars label{
  float: right;
  font-size: 100px;
  color: lightgrey;
  margin: 0 5px;
  text-shadow: 1px 1px #bbb;
}
.stars label:before{
  content: '★';
}
.stars input:checked ~ label{
  color: gold;
  text-shadow: 1px 1px #c60;
}
.stars:not(:checked) > label:hover,
.stars:not(:checked) > label:hover ~ label{
  color: gold;
}
.stars input:checked > label:hover,
.stars input:checked > label:hover ~ label{
  color: gold;
  text-shadow: 1px 1px goldenrod;
}
.stars .result:before{
  position: absolute;
  content: "";
  width: 100%;
  left: 50%;
  transform: translateX(-47%);
  bottom: -30px;
  font-size: 30px;
  font-weight: 500;
  color: gold;
  font-family: 'Poppins', sans-serif;
  display: none;
}
.stars input:checked ~ .result:before{
  display: block;
}
.stars #five:checked ~ .result:before{
  content: "";
}
.stars #four:checked ~ .result:before{
  content: "";
}
.stars #three:checked ~ .result:before{
  content: " ";
}
.stars #two:checked ~ .result:before{
  content: "";
}
.stars #one:checked ~ .result:before{
  content: "";
}






.menus {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 20px;
  }

  .menu-card {
    display: flex;
    width: 100%;
    margin-bottom: 20px;
    background-color: #FFDDC1; /* Color de fondo naranja claro */
    border-radius: 10px;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .menu-image {
    width: 40%; /* Tamaño fijo para las imágenes */
  height: 250px; /* Ajusta la altura según tu preferencia */
  object-fit: cover; /* Ajusta el comportamiento de la imagen */
    
  }

  .menu-details {
    padding: 20px;
    width: 60%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: #FFAC30; /* Color de fondo naranja oscuro */
    border-radius: 0 10px 10px 0;
  }

  .menu-name {
    font-size: 48px; /* Aumentar el tamaño de la fuente */
    /*margin: 0 0 10px 0;*/ /* Ajustar los márgenes para reducir el espacio */
    margin-bottom: 0;
    color: #333333; /* Color de texto gris oscuro */
  }

  .menu-description {
    font-size: 20px; /* Aumentar el tamaño de la fuente */
    margin: 0 0 10px 0; /* Ajustar los márgenes para reducir el espacio */
    color: #555555; /* Color de texto gris */
  }

  .menu-price {
    font-size: 22px; /* Aumentar el tamaño de la fuente */
    color: #333333; /* Color de texto gris oscuro */
  }

</style>