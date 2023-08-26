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

<body>
  <div class="container">
    <div class="item">
      <h1 class="text_title">Bienvenido, {userNow.username}</h1>
      <div class="center-image">
        <img src={userNow.imagen} alt="Imagen de perfil" width="200px" height="200px" />
        <p class="email">{userNow.email}</p>
      </div>
    </div>
    <div class="options">
      <div class="notification-card">
        <h1 class="text_center">Mis eventos</h1>
        
          {#if hayEventosDeParticipacion}
            {#each eventos as evento}
              <div class="notification-card-int">
                <h2>{evento.nombre}</h2>
                <p>{evento.dia}</p>
                {#if isAvailable(evento)}
                  <button class="button-action" on:click={() => cancelarParticipacion(evento)}>
                    Cancelar Participación
                  </button>
                {:else}
                  <p class="text_center_black">Este evento ya no está disponible</p>
                {/if}
              </div>
            {/each}
          {:else}
            <div class="notification-card-int">
              <h2>¿No has participado en ningún evento?, ¡inténtalo ahora!</h2>
              <button class="button-action" on:click={goToEventos}>¿Quieres intentarlo?</button>
            </div>
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