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
 

 
</script>
<div class="menus">
  <h1>Menusss</h1>
  <h1>{restaurante.nombre}</h1>

  {#each menus as menu}
    <h1>{menu.nombre}</h1>
  {/each}
</div>

{#if !calificando}
  <button on:click={mostrarMenuCalificacion}>Calificar restaurante</button>
{:else}
  <div class="center">
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

    <div class="text-input">
      <label for="review">Ingresa tu opinión:</label>
      <textarea id="review" name="review" rows="4" cols="50" bind:value={reviewText}></textarea>
    </div>

  </div>

  <button on:click={mostrarMenuCalificacion}>Enviar calificación</button>
{/if}

<style>
  *{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.center{
  position: fixed;
  top: 45%;
  left: 20%;
  transform: translate(-50%, -50%);
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
  content: "Me encanta ";
}
.stars #four:checked ~ .result:before{
  content: "Me gusta ";
}
.stars #three:checked ~ .result:before{
  content: "Está Bien ";
}
.stars #two:checked ~ .result:before{
  content: "No me gusta ";
}
.stars #one:checked ~ .result:before{
  content: "Me disgusta ";
}
</style>
