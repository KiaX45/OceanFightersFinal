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
  //vamos a traer la base de datos de usuarios
  let usuarios = [];
  let usuarioActual = null;
  let correo;
  let imagen;
  let username;
    const getUsers = onSnapshot(
    collection(db, "Usuarios"),
    (querySnapshot) => {
      usuarios = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });

      //solo debemos traer el usuario 
      usuarios = usuarios.filter((usuario) => {
        return usuario.uid == $admin.uid;
      });

      usuarioActual = usuarios[0];
      console.log(usuarioActual);
      correo = usuarioActual.email;
      imagen = usuarioActual.image;
      username = usuarioActual.username;
    },
    (error) => {
      console.log(error);
    }
  );

  //Vamos a dejar de que escuche los cambios
  onDestroy(() => {
    unsub();
    getUsers();
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
      showMistake(error);
    }
  };

   //funciones para mopstrar notificaciones de errores
   let notificationShown = false;

const styleElement = document.createElement("style");
styleElement.innerHTML = `
@keyframes vibrate {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(3px);
  }
  100% {
    transform: translateX(0);
  }
}
`;
document.head.appendChild(styleElement);

const showMistake = (mensaje) => {
  if (!notificationShown) {
    notificationShown = true;

    const toast = Toastify({
      text: mensaje,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "center",
      stopOnFocus: true,
      style: {
        animation: "fadeIn 0.5s ease-in-out, vibrate 0.2s infinite",
        background: "linear-gradient(to right, #ff0000, #FF8F00)",
        boxShadow: "0px 10px 60px rgba(256, 0, 0, 10)",
      },
    });

    toast.showToast();

    setTimeout(() => {
      notificationShown = false;
    }, 3000);
  }
};

//funciones para mopstrar notificaciones de exito
let successNotificationShown = false;

const showSucces = (mensaje) => {
  if (!successNotificationShown) {
    successNotificationShown = true;

    const toast = Toastify({
      text: mensaje,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "center",
      stopOnFocus: true,
      style: {
        animation: "fadeIn 0.5s ease-in-out, vibrate 0.2s infinite",
        background: "linear-gradient(to right, #1BF81F, #05DE6E)",
        boxShadow: "0px 10px 60px rgba(0, 0, 0, 10)",
        color: "black",
      },
    });

    toast.showToast();

    setTimeout(() => {
      successNotificationShown = false;
    }, 3000); // Reset the flag after the notification duration
  }
};


</script>

<body>
  <div class="container">
    <div class="item">
      <h1 class="text_title">Bienvenido, {username}</h1>
      <div class="center-image">
        <img alt="Imagen de perfil" width="200px" height="200px" src={imagen}/>
        <p class="email">{correo}</p>
      </div>
    </div>
    <div class="options">
      <div class="notification-card">
        <h1 class="text_center" style="align-items: center; display: flex; justify-content: center;" >Notificaciones</h1>
        {#if $admin}
          {#if notificaciones.length <= 0}
            <h2 class="text_center">No hay notificaciones</h2>
          {:else}
            {#each notificaciones as notificacion}
              <div class="notification-card-int">
                <h2>{notificacion.nombreEvento}</h2>
                <p>{notificacion.mensaje}</p>
                <p>{notificacion.fecha}</p>
                <button class="button-action" on:click={() => resolverNotificacion(notificacion)}>
                  Resolver notificación
                </button>
              </div>
            {/each}
          {/if}
        {/if}
      </div>
    </div>
  </div>
</body>

<style>
  body {
    background-color: #f2f5fa;
    margin: 0;
    font-family: Arial, sans-serif;
    background-image: url(https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Perfil%2Fmar.JPG?alt=media&token=69f22291-e29c-478c-94c6-503cc73b465b);
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
  }

  .container {
    display: flex;
    align-items: flex-start;
    padding: 20px;
  }

  .item {
    flex-basis: 40%;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 15px;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
    margin-top: 20px;
  }

  .item h1 {
    font-size: 24px;
    margin-top: 0;
    color: #333333;
  }

  .center-image {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 20px;
  }

  img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
  }

  .email {
    font-size: 18px;
    color: #555555;
    margin-top: 10px;
  }

  .options {
    flex-basis: 60%;
    padding-left: 100px;
    width: 100%;
  }

  .notification-card {
    padding: 20px;
    margin-top: 20px;
    background-color: #f9fafb;
    border-radius: 10px;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .notification-card-int {
    padding: 20px;
    margin-top: 20px;
    background-color: #f5f0c2;
    border-radius: 10px;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    width: 100%;
  }

  .notification-card:hover {
    transform: translateY(-5px);
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  }

  .button-action {
    background-color: #ffa500;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .button-action:hover {
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(255, 165, 0, 0.7);
  }
</style> 