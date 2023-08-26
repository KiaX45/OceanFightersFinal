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
  //importamos lo necesario para la subida de imagenes
  import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
  import { storage } from "../firebase";

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

let selectedImage: File | undefined;
  //Función para seleccionar la imagen
  function handleImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      selectedImage = input.files[0];
      console.log(selectedImage);
      mostrarbotonenviar = true;
    }
  }

//Metodos para cambiar la imagen de usuario
let resultImage: string | undefined;
let mostrarbotonenviar = false;
  async function uploadFile(file) {
    const storageRef = ref(storage, `usuarios/${username}`);
    await uploadBytes(storageRef, file);
    resultImage = await getDownloadURL(storageRef);
    console.log(resultImage);
    if (resultImage) {
      mostrarbotonenviar = true;
      usuarioActual.image = resultImage;
      handleEdit();
    }
  };

  const handleEdit = async () => {
    //creamos la función de editar restaurante
    try {
      //pedimos una confirmación
      if(confirm("¿Estas seguro de cambiar la imagen?")){
        console.log(usuarioActual);
        //await uploadFile(selectedImage);
        let currentid = usuarioActual.id;
        await updateDoc(doc(db, "Usuarios", currentid), usuarioActual);
        showSucces("Imagen cambiada");
        imagen = resultImage;
        mostrarbotonenviar = false;
      }
      else{
        mostrarbotonenviar = false;
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };


</script>

<body class="body">
  <div class="row">
    <div class="item_full">
      <h1 class="text_center">Bienvenido, {username}</h1>
    </div>
  </div>

  <div class="row_options">
    <div class="item_admin">
      <br />
      <p class="text_center">Tu foto</p>
      <section class="center_image">
        <img alt="Imagen de perfil" width="200px" height="200px" src={imagen}/>
      </section>
      <br />
      <p class="text_center">Tu correo</p>
      <p class="text_center">Correo Aqui {correo}</p>
      <br />

      
    </div>

    <div class="item_options">
      <section class="center_image">
        {#if $admin}
          <div class="text_center">
            <h1>Notificaciones</h1>
          </div>
          {#if notificaciones.length <= 0}
            <h1 class="text_center">
              <br />
              No hay notificaciones
            </h1>
          {:else}
            {#each notificaciones as notificacion}
              <div class="notification_card">
                <h1>{notificacion.nombreEvento}</h1>
                <h1>{notificacion.mensaje}</h1>
                <h1>{notificacion.fecha}</h1>
                <button
                  class="button_action_notify"
                  on:click={() => resolverNotificacion(notificacion)}
                  >Resolver notificacion</button
                >
              </div>
            {/each}
          {/if}
        {/if}
      </section>
    </div>
  </div>
</body>
  
 

<style>
  .body {
    background-color: #082543;
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
    background-image: url(https://plustatic.com/4059/conversions/diferencias-mar-oceano-social.jpg);
    background-repeat: no-repeat;
    background-size: auto;
    align-items: center;
    align-content: center;
    flex-basis: calc(50% - 10px); /* Ancho de las columnas con margen */
    background-color: #1e72b7;
    flex-direction: column;
    border-radius: 15px;
    min-height: 400px; /* Tamaño mínimo en altura */
    max-width: 50%;
  }

  .item_options {
    background-image: url(https://plustatic.com/4059/conversions/diferencias-mar-oceano-social.jpg);
    background-repeat: no-repeat;
    background-size: auto;
    align-items: center;
    align-content: center;
    flex-basis: calc(50% - 10px); /* Ancho de las columnas con margen */
    flex-direction: column;
    border-radius: 15px;
    min-height: 400px; /* Tamaño mínimo en altura */
    max-width: 50%;
  }

  .item_full {
    flex-basis: calc(99.33% - 10px); /* Ancho de las columnas con margen */
    justify-content: center;
    align-items: center;
  }

  .text_center {
    align-items: center;
    justify-content: center;
    text-align: center;
    font-family: "Times New Roman", Times, serif;
    font-size: larger;
    color: white;
  }

  .row_options {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px; /* Espacio entre filas */
    align-items: center;
  }

  .center_image {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .notification_card {
    border: 2px solid #1687ed;
    padding: 15px;
    border-radius: 10px;
    width: 80%;
    background-color: #5eacf0;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-family: 'Times New Roman', Times, serif;
    font-size: larger;
  }

  .notification_card:hover {
    transform: translateY(-5px);
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  }

  .button_action_notify {
    background-color: goldenrod;
    border-radius: 10px;
    transition: transform 200ms ease-in-out, box-shadow 200ms ease-in-out;
  }

  .button_action_notify:hover {
    animation: pulse 1s infinite;
    box-shadow: 0 0 10px 5px rgba(0, 255, 255, 0.7);
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    } /* Cambia el tamaño a un 10% más grande */
    100% {
      transform: scale(1);
    }
  }
</style>
