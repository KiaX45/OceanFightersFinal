<script>
  //importamos lo necesario para conectarnos la base de datos
  import { db } from "../../firebase";
  import {
    addDoc,
    collection,
    onSnapshot,
    updateDoc,
    doc,
    deleteDoc,
  } from "firebase/firestore";

  //importamos onDestroy para que se ejecute cuando se destruya el componente
  import { onDestroy } from "svelte";

  //Importamos user de las stores
  import { user } from "../../stores/User";

  //Importamos navigate de svelte Routing
  import { navigate } from "svelte-routing";

  //Importamos los modulos para mostrar notificaciones de toastify
  import Toastify from "toastify-js";

  console.log($user);

  //Creamos un objeto usuario
  let userNow = {
    uid: "",
    username: "",
    email: "",
    imagen:
      "https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Users%2Fuserfoto.jpg?alt=media&token=1bb0cebc-14a5-4e20-94ed-aaa191ddf958",
  };

  //Nos conectamos a la base de datos usuarios
  let usuarios = [];
  const unsub = onSnapshot(
    collection(db, "Usuarios"),
    (querySnapshot) => {
      usuarios = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });

      usuarios = usuarios.filter((usuario) => {
        return usuario.uid == $user.uid;
      });
      if (usuarios.lenght > 1) {
        console.log("Hay mas de un usuario con el mismo correo");
      }
      userNow.uid = usuarios[0].uid;
      userNow.username = usuarios[0].username;
      userNow.email = usuarios[0].email;
      if (usuarios[0].imagen != null) {
        userNow.imagen = usuarios[0].imagen;
      }
      console.log(userNow);
    },
    (error) => {
      console.log(error);
    }
  );

  //Array de los eventos de este usuario
  let participantes = [];
  let participantesSinFiltrar = [];
  const unsub2 = onSnapshot(
    collection(db, "participantes"),
    (querySnapshot) => {
      participantes = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });

      console.log(participantes);
      participantesSinFiltrar = participantes;
      participantes = participantesSinFiltrar.filter((evento) => {
        return evento.uidParticipante == $user.uid;
      });

      console.log($user.uid);
      console.log(participantes);
    },
    (error) => {
      console.log(error);
    }
  );

  //Variable para saber cuando hay eventos
  let hayEventosDeParticipacion = true;

  //vamos a traer los eventos de este usuario
  let eventos = [];
  let eventosSinFiltrar = [];
  const unsub3 = onSnapshot(collection(db, "Eventos"), (querySnapshot) => {
    eventos = querySnapshot.docs.map((doc) => {
      return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
    });
    //Comprobamos si este usuario ha participado en algun evento
    if (participantes.length !== 0) {
      //variable para guardar el array de codigo de eventos
      let codigosEventos = [];
      //de todos los eventos que traemos solo mostramos en los que este usuario esta participando
      eventosSinFiltrar = eventos;
      for (let index = 0; index < participantes.length; index++) {
        codigosEventos.push(participantes[index].uidEvento);
      }
      eventos = eventosSinFiltrar.filter((evento) => {
        return codigosEventos.includes(evento.id);
      });
    } else {
      hayEventosDeParticipacion = false;
    }

    console.log(eventos);
  });

  //Vamos a dejar de que escuche los cambios
  onDestroy(() => {
    unsub3();
    unsub2();
    unsub();
  });

  //funciones para navegar al apartado de eventos
  const goToEventos = () => {
    console.log("Si");
    navigate("/eventos");
  };

  //Funciones para corroborar si un evento sigue estando vigente
  const isAvailable = (eventoOnSelect) => {
    console.log(eventoOnSelect.dia);
    let fechaEvento = new Date(eventoOnSelect.dia);
    let fechaActual = new Date();
    if (fechaEvento > fechaActual) {
      return true;
    } else {
      return false;
    }
  };

  let confirmation;
  //Funciones para dejar de participar
  const cancelarParticipacion = (eventoOnSelect) => {
    if (
      (confirmation = window.confirm(
        "¿Estás seguro de que quieres continuar? "
      ))
    ) {
      //actualizamos el evento
      let currentid = eventoOnSelect.id;
      eventoOnSelect.participantes = eventoOnSelect.participantes - 1;

      try {
        // updateDoc(doc(db, "Eventos", currentid), eventoOnSelect);
        //borramos de la base de datos de participantes
        let idParticipante = participantes.filter((participante) => {
          return (
            participante.uidEvento == currentid &&
            participante.uidParticipante == $user.uid
          );
        });
        console.log(idParticipante);
        deleteDoc(doc(db, "participantes", idParticipante[0].id));
        showSucces("Has cancelado tu participación en el evento");
      } catch (error) {
        console.log(error);
      }
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

<body class="body">
  <!--Información del usuario-->
  <div class="row">
    <div class="item_full">
      <h1 class="text_center">Bienvenido, {userNow.username}</h1>
    </div>
  </div>

  <div class="row_options">
    <div class="item_admin">
      <br />
      <p class="text_center">Tu foto</p>
      <section class="center_image">
        <img
          src={userNow.imagen}
          alt="Imagen de perfil"
          width="200px"
          height="200px"
        />
      </section>
      <br />
      <p class="text_center">Tu correo</p>
      <p class="text_center">{userNow.email}</p>
      <br />
    </div>

    <div class="item_options">
      <section class="center_image">
        <!--Comprobamos si hay eventos para mostrar-->
        {#if hayEventosDeParticipacion}
          <!--Información de los eventos-->
          {#each eventos as evento}
            <div class="event-card">
              <br />
              <h1>{evento.nombre}</h1>
              <h1>{evento.dia}</h1>
              {#if isAvailable(evento)}
                <button
                  class="button_action_cancel"
                  on:click={() => cancelarParticipacion(evento)}
                  >Cancelar Participación</button
                >
              {:else}
                <h1 class="text_center">Este evento ya no esta disponible</h1>
              {/if}
            </div>
          {/each}
        {:else}
          <div class="event-card">
            <h1>¿No has participado en ningun evento?, ¡intentalo ahora!</h1>
            <button class="button_action" on:click={goToEventos}
              >¿Quieres intentarlo?</button
            >
          </div>
        {/if}
      </section>
    </div>
  </div>
</body>

<style>
  .body {
    background-color: #082543;
  }

  .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px; /* Espacio entre filas */
    align-items: center;
    justify-content: center;
  }

  .item_full {
    flex-basis: calc(99.33% - 10px); /* Ancho de las columnas con margen */
    /*background-color: rgb(211, 211, 211);
    border: 1px solid gray;*/
    padding: 10px;
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

  .item_admin {
    align-items: center;
    align-content: center;
    flex-basis: calc(50% - 10px); /* Ancho de las columnas con margen */
    background-color: #1e72b7;
    /*border: 1px solid gray;*/
    flex-direction: column;
    border-radius: 15px;
    min-height: 400px; /* Tamaño mínimo en altura */
    max-width: 50%;
  }

  .item_options {
    align-items: center;
    align-content: center;
    flex-basis: calc(50% - 10px); /* Ancho de las columnas con margen */
    background-color: #1e72b7;
    /*border: 1px solid gray;*/
    flex-direction: column;
    border-radius: 15px;
    min-height: 400px; /* Tamaño mínimo en altura */
    max-width: 50%;
  }

  .center_image {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .button_action {
    background-color: aqua;
    border-radius: 10px;
    transition: transform 200ms ease-in-out, box-shadow 200ms ease-in-out;
  }

  .button_action:hover {
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
  .button_action_cancel {
    background-color: #AB2A3E;
    border-radius: 10px;
    transition: transform 200ms ease-in-out, box-shadow 200ms ease-in-out;
    color: white;
  }

  .button_action_cancel:hover {
    animation: pulse 1s infinite; /* Aplicar animación al pasar el cursor sobre el botón */
    box-shadow: 0 0 10px 5px rgba(255, 42, 0, 0.7);
  }

  .button_action_cancel:focus {
  background-color: #AB2A3E; 
  color: white; 
  outline: none; 
}

  .event-card {
    border: 2px solid #1687ED;
    padding: 15px;
    border-radius: 10px;
    width: 80%;
    background-color: #5EACF0;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .event-card:hover {
    transform: translateY(-5px);
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  }
</style>
