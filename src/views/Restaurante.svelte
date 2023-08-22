<script lang="ts">
  //importamos lo necesario para comunicar con la base de datos
  import { db } from "../firebase";
  import {
    addDoc,
    collection,
    onSnapshot,
    updateDoc,
    doc,
  } from "firebase/firestore";

  //importamos las stores
  import { user, admin } from "../stores/User";

  // importamos onMount para que se ejecute la funcion cuando se monte el componente
  //importamos onDestroy para que se ejecute la funcion cuando se destruya el componente
  import { onMount, onDestroy } from "svelte";

  //importamos la navegación
    import { navigate } from "svelte-routing";
  
    //importamos las store
    import {menuStore, getMenu} from "../stores/Menu";


  //Traemos la base de datos de Restaurantes
  //creamos una variable para guardar los restaurantes
  let restaurantes = [];
  
  let restauranntesSinFiltro = [];
  const unsub = onSnapshot(
    collection(db, "Restaurantes"),
    (querySnapshot) => {
      restaurantes = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });
      //vamos a guardar los restaurantes solo que sean visibles
      restauranntesSinFiltro = restaurantes;
      restaurantes = restauranntesSinFiltro.filter((restaurante) => restaurante.visible);

      console.log(restaurantes);
    },
    (error) => {
      console.log(error);
    }
  );
  //Vamos a dejar de que escuche los cambios
  onDestroy(() => {
    unsub();
  });
  //Función parala busqueda de restaurantes
  let busqueda = "";

  $: {
     console.log(busqueda);
    restaurantes.forEach(element => {
        //console.log(element)
        busqueda = busqueda.toLowerCase();
        if(!element.nombre.toLowerCase().includes(busqueda)){
            console.log(element.nombre)
          element.visible = false;
          console.log(element.visible)
        }else{
            element.visible = true;
        }
        
    });
    console.log(restaurantes)
  };

  
      //Funciones para ir a menus
      //Funcion para ir a menu
      const gotoMenu = (restaurante) => {
        //guardamos la información del restaurate en la store
        menuStore.set(restaurante);
        //navegamos a la vista de menu
        navigate("/menus", { replace: true });
      };


</script>
<body>
  <h1 style="color: #ee8b09; display: flex; justify-content: center;">Restaurantes</h1>

  <!--Busqueda de restaurantes-->
  <div style="display: flex; justify-content: center;">
    <input
      type="text"
      placeholder="Busque por el nombre del restaurante"
      bind:value={busqueda}
      style="margin-bottom: 20px; padding: 5px; border: 1px solid #ee8b09; border-radius: 5px;"
    />
  </div>

  <div class="container1">
    {#each restaurantes as restaurante}
    {#if restaurante.visible}
    <div class="restaurant-card">
      <img src={restaurante.img} alt="Imagen del restaurante" style="max-width: 100%;" />
      <h1>{restaurante.nombre}</h1>
      <h2>{restaurante.direccion}</h2>
      <h3>{restaurante.telefono}</h3>
      <h4>Hora de Apertura: {restaurante.horaApertura}</h4>
      <h4>Hora de Cierre: {restaurante.horaCierre}</h4>
      <h5>{restaurante.descripcion}</h5>
      <button on:click={() => gotoMenu(restaurante)}>Ver Menú</button>
    </div>
    {/if}
    {/each}
  </div>
</body>

<style>
  body {
     background-image: url(https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Restaurantes%2Frestaurantefondo.jpg?alt=media&token=63d7cc45-03b3-475b-9a94-f8d53462dfa5);
    background-size: cover; 
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-color: rgba(248, 243, 243, 0.1);
  }

  body::before {
    content: "";
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    z-index: -1;
  }

  .container1 {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }

  .restaurant-card {
  border: 2px solid #dfbe08;
  padding: 15px;
  border-radius: 10px;
  width: 300px;
  background-color: rgba(209, 166, 23, 1); /* Cambia el valor alpha para ajustar la transparencia */
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

  .restaurant-card:hover {
    transform: translateY(-5px);
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  }

  .restaurant-card h1 {
    font-size: 24px;
    color: #f7e334;
    margin-bottom: 5px;
  }
  

  .restaurant-card h2,
  .restaurant-card h3,
  .restaurant-card h4,
  .restaurant-card h5 {
    font-size: 14px;
    color: #fff; /* Cambio de color de letra en las tarjetas */
    margin-bottom: 3px;
  }

  .restaurant-card button {
    background-color: #ee8b09;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .restaurant-card button:hover {
    background-color: #9b4b09;
  }
</style>