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

<h1>Perfil</h1>
<h1>{$admin.displayName}</h1>
<img
  src={$admin.photoURL}
  alt="imagen de perfil"
  style="height: 60%; with:60%"
/>

<!--Parte de Administrador-->
{#if $admin}
  <h1>notificaciones</h1>
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
</style>
