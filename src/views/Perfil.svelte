<script lang="ts">
  //importamos user y admin de las store
  import { user, admin } from "../stores/User";

  //importamos lo necesario para la comunicación con la base de datos
  import { db } from "../firebase";
  import {
    addDoc,
    collection,
    onSnapshot,
    updateDoc,
    doc,
  } from "firebase/firestore";

  //importamos onDestroy para que se ejecute cuando se destruya el componente
  import { onDestroy } from "svelte";

  //impórtar los modulos para mostrar notificaciones de toastify
  import Toastify from "toastify-js";

  //traemos las notificaciones que esten vigentes
  let notificaciones = [];
  const unsub = onSnapshot(
    collection(db, "notificaciones"),
    (querySnapshot) => {
      notificaciones = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });

      notificaciones = notificaciones.filter((notificacion) => {
        return notificacion.viable == true;
      });
    },
    (error) => {
      console.log(error);
    }
  );

  //Vamos a dejar de que escuche los cambios
  onDestroy(() => {
    unsub();
  });

  //funciones para resolver notificaciones
  const resolverNotificacion = async (currentNotificatio) => {
    try {
      currentNotificatio.viable = false;
      await updateDoc(
        doc(db, "notificaciones", currentNotificatio.id),
        currentNotificatio
      );
      showSucces("Notificacion resuelta");
    } catch (error) {
      console.log(error);
    }
  };

  //funciones de muestra de notificaciones
  const showSucces = (message: String) => {
    //crear notificacion de exito
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "center",
      backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
      stopOnFocus: true,
    }).showToast();
  };
</script>

<body>
  <div class="row">
    <div class="item_full">
      <h1 class="text_center">Bienvenido a tu perfil</h1>
    </div>
  </div>

  <div class="row_options">
    <div class="item_admin">
      <h4 class="text_top">Seccion para foto e informacion Mas adelante</h4>
    </div>
    <div class="item_options">
      <h5 class="text_top">Seccion para resolver notificaciones</h5>
      {#if $admin}
        <div class="text_center">
          <h1>notificaciones</h1>
        </div>
        {#if notificaciones.length <= 0}
          <h1>No hay notificaciones</h1>
        {:else}
          {#each notificaciones as notificacion}
            <div class="notifications">
              <h1>{notificacion.nombreEvento}</h1>
              <h1>{notificacion.mensaje}</h1>
              <h1>{notificacion.fecha}</h1>
              <button on:click={() => resolverNotificacion(notificacion)}
                >Resolver notificacion</button
              >
            </div>
          {/each}
        {/if}
      {/if}
    </div>
  </div>
</body>

<style>
  /*Estilos para las notificaciones*/
  .notifications {
    border: 1px solid black;
    margin: 10px;
    padding: 10px;
    border-radius: 10px;
  }
  /*estilos para los botones dentro de notificaiones*/
  .notifications button {
    margin: 10px;
    padding: 10px;
    border-radius: 10px;
    border: none;
    background-color: #ff416c;
    color: white;
    font-weight: bold;
    cursor: pointer;
  }

  /*Trabajar filas y columnas*/
  .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px; /* Espacio entre filas */
    align-items: center;
    justify-content: center;
  }
  .item_admin {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-basis: calc(50% - 10px); /* Ancho de las columnas con margen */
    background-color: lightgray;
    border: 1px solid gray;
  }

  .item_options {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-basis: calc(50% - 10px); /* Ancho de las columnas con margen */
    background-color: lightgray;
    border: 1px solid gray;
  }

  .item_full {
    flex-basis: calc(99.33% - 10px); /* Ancho de las columnas con margen */
    background-color: rgb(211, 211, 211);
    padding: 10px;
    border: 1px solid gray;
    justify-content: center;
    align-items: center;
  }

  .text_center {
    align-items: center;
    justify-content: center;
    text-align: center;
    font-family: "Times New Roman", Times, serif;
    font-size: larger;
  }

  .text_top {
    display: flex;
    align-items: flex-start;
    font-family: "Times New Roman", Times, serif;
    font-size: larger;
  }

  .row_options {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px; /* Espacio entre filas */
    align-items: center;
  }
</style>
