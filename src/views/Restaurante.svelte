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

  const unsub = onSnapshot(
    collection(db, "Restaurantes"),
    (querySnapshot) => {
      restaurantes = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });
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

<h1 style="color: #1687ED;">Restaurantes</h1>

<!--Busqueda de restaurantes-->
<input type="text" placeholder="Busque por el nombre del restaurante" bind:value={busqueda} style="margin-bottom: 20px; padding: 5px; border: 1px solid #1687ED; border-radius: 5px;">

<div class="container1">
  {#each restaurantes as restaurante}
    {#if restaurante.visible}
      <div class="restaurant-card">
        <h1>{restaurante.nombre}</h1>
        <h2>{restaurante.direccion}</h2>
        <h3>{restaurante.telefono}</h3>
        <h4>{restaurante.horario}</h4>
        <h5>{restaurante.descripcion}</h5>
        <button on:click={() => gotoMenu(restaurante)}>Ver Menú</button>
      </div>
    {/if}
  {/each}
</div>

<style>
  .container1 {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }

  .restaurant-card {
    border: 2px solid #1687ED;
    padding: 15px;
    border-radius: 10px;
    width: 300px;
    background-color: #fff;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .restaurant-card:hover {
    transform: translateY(-5px);
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  }

  .restaurant-card h1 {
    font-size: 24px;
    color: #1687ED;
    margin-bottom: 5px;
  }

  .restaurant-card h2,
  .restaurant-card h3,
  .restaurant-card h4,
  .restaurant-card h5 {
    font-size: 14px;
    color: #666;
    margin-bottom: 3px;
  }

  .restaurant-card button {
    background-color: #1687ED;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .restaurant-card button:hover {
    background-color: #1369c2;
  }
</style>