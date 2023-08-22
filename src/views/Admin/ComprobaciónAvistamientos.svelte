<script lang="ts">
  /**
   * @version 1.0.0
   * Este modulo cumplira la función de permitir a los administradores comprobar las imagenes subidas por los usuarios
   * y decidir si son validas o no.
   * Tambien vamos a permitir a los administrasdores controlar la visibilidad de los avistamientos de cada una de las ubicaciones validas
   */

  //Importar onMount y onDestroy
  import { onMount, onDestroy } from "svelte";

  //importamos los modulos para mostrar notificaciones de toastify
  import Toastify from "toastify-js";


  //importamos los modulos necesarios para comunicar con la base de datos
  import { db } from "../../firebase";
  import {
    addDoc,
    collection,
    onSnapshot,
    updateDoc,
    doc,
  } from "firebase/firestore";

  //funciones para el filtrado de avistamientos en base a la locacion
  //variable para guardar la variable de filtrado
  let locacion: string = "Locación 1";
  //funcion diseañada para el cambio de locacion
  const handleChange = (locacionenter: number) => {
    if (locacionenter == 1) {
      locacion = "Locación 1";
    } else if (locacionenter == 2) {
      locacion = "Locación 2";
    } else if (locacionenter == 3) {
      locacion = "Locación 3";
    } else if (locacionenter == 4) {
      locacion = "Locación 4";
    }
    console.log(locacion);
  };

  //Funciones para traer los avistamientos de la base de datos
  //variable para guardar los avistamientos
  let avistamientos: any = [];
  //variable para guardar los avistamientos sin filtrar
  let avistamientosSinFiltrar: any = [];
  //funcion para traer los avistamientos de la base de datos
  //Traer los restaurantes de la base de datos
  const unsub = onSnapshot(
    collection(db, "Avistamientos"),
    (querySnapshot) => {
      avistamientos = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });
      //guardamos los avistamientos sin filtrar
      avistamientosSinFiltrar = avistamientos;

      //Utilizamos las función filter para filtrar en base a la locacion
      console.log(locacion);
      console.log(avistamientos);

      console.log("Filtrando");
      avistamientos = avistamientosSinFiltrar.filter((avistamiento: any) => {
        return avistamiento.locacion == locacion;
      });

      //solo se deben mostrar los avistamientos cuya visbleAdmin sea verdadero
      avistamientos = avistamientos.filter((avistamiento: any) => {
        return avistamiento.visibleAdmin == true;
      });

      //comprobamos que se esten filtrando los avistamientos
      console.log(avistamientos.length);
      console.log(avistamientos);
    },
    (error) => {
      console.log(error);
    }
  );

  //Vamos a dejar de que escuche los cambios
  onDestroy(() => {
    unsub();
  });

  //creamoos una función reactiva para el filtrado de avistamientos
  $: {
    avistamientos = avistamientosSinFiltrar.filter((avistamiento: any) => {
      return avistamiento.locacion == locacion;
    });
    //solo se deben mostrar los avistamientos cuya visbleAdmin sea verdadero
      avistamientos = avistamientos.filter((avistamiento: any) => {
        return avistamiento.visibleAdmin == true;
      });

    console.log(avistamientos);
  }

  //Funciones para la edición de propiedades
  const handleEdit = async (Avistamientodit) => {
    //comprobamos si el avistamiento esta visible o no
    Avistamientodit.visible = !Avistamientodit.visible;
    try {
      await updateDoc(
        doc(db, "Avistamientos", Avistamientodit.id),
        Avistamientodit
      );
      //mostramos la notificación de exito
      mostrarNotificacionExito();
      console.log("Avistamiento editado");
    } catch (error) {
      console.log(error);
    }
  };

  //Funciones para la eliminación de avistamientos
  const handleDelete = async (avistamientoonDelete) => {
    try {
      //Pedimos una confirmación en forma de alerta
      const confirmacion = confirm("¿Estas seguro de eliminar el avistamiento?");
      if (!confirmacion) {
        return;
      }
      //eliminamos el avistamiento
      avistamientoonDelete.visibleAdmin = false;
      //oculatamos el avistamiento para los usuarios
      avistamientoonDelete.visible = false;
      updateDoc(doc(db, "Avistamientos", avistamientoonDelete.id), avistamientoonDelete);
      //mostramos la notificación de exito
      mostrarNotificacionExito();
      console.log("Avistamiento eliminado");
    } catch (error) {
      console.log(error);
    }
  };



  //Funciones para la muestra de notificaciones de exito
  const mostrarNotificacionExito = () => {
    Toastify({
      text: "Avistamiento editado con exito",
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#4caf50",
      stopOnFocus: true,
    }).showToast();
  };
</script>

<!--Se mostraran las locaciones pertinentes para la filtraci'on de locaciones-->
<div class="containerTags">
  <button on:click|preventDefault={() => handleChange(1)}>Locación 1</button>
  <button on:click|preventDefault={() => handleChange(2)}>Locación 2</button>
  <button on:click|preventDefault={() => handleChange(3)}>Locación 3</button>
  <button on:click|preventDefault={() => handleChange(4)}>Locación 4</button>
</div>

<!--Comprobamos si el arreglo esta vació-->
{#if avistamientos.length == 0}
  <h1>No hay avistamientos</h1>
{:else}
  <!--Se mostraran los avistamientos de la locacion seleccionada-->
  {#each avistamientos as avistamiento}
    <div class="containerAvistamientos">
      <img src={avistamiento.foto} alt="" style="width: 60%; height: 60%;" />
      <div class="conteinertagsAvistamiento">
        <p>{avistamiento.nombre}</p>
        <p>{avistamiento.fecha}</p>
        <p>{avistamiento.locacion}</p>
        <p>{avistamiento.descripcion}</p>
      </div>
      {#if avistamiento.visible == false}
        <button on:click={() => handleEdit(avistamiento)}>Mostrar</button>
      {:else}
        <button on:click={() => handleEdit(avistamiento)}>Ocultar</button>
      {/if}
      <button on:click={() => handleDelete(avistamiento)}>Eliminar</button>
    </div>
  {/each}
{/if}

<style>
  /*estilos para las locaciones*/
  .containerTags {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    height: 100px;
    background-color: #f1f1f1;
    border-radius: 10px;
    margin: 10px;
  }

  /*estilos para las locaciones*/
  .containerAvistamientos {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    height: 500px;
    background-color: #f1f1f1;
    border-radius: 10px;
    margin: 10px;
  }

  .conteinertagsAvistamiento {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    height: 100px;
    background-color: #f1f1f1;
    border-radius: 10px;
    margin: 10px;
  }
</style>
