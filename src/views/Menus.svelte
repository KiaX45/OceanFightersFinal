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


</script>

<h1>Menusss</h1>
<h1>{restaurante.nombre}</h1>

{#each menus as menu}
    <h1>{menu.nombre}</h1>
{/each}

<style>


</style>