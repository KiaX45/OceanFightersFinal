<script lang="ts">
  //vamos aimportar las store de eventos
  import { eventoStore, idEvento } from "../../stores/Evento";

  //importamos onMount para que se ejecute cuando se monte el componente
  import { onDestroy, onMount } from "svelte";

  //importamos el tipo evento
  import type { evento } from "../../lib/logic/eventos";

  //importamos los modulos neccesarios para mostrar notificaciones
  import { db } from "../../firebase";
  import {
    addDoc,
    collection,
    onSnapshot,
    updateDoc,
    doc,
  } from "firebase/firestore";

  //importamos user y admin
  import { user, admin } from "../../stores/User";

  //importamos el tipo participantes
  import type { Participacion } from "../../lib/logic/participaciones";

  //importamos los modulos de notificaciones
  import Toastify from "toastify-js";

  //impoporamos el tipo notificacion
  import type { Notificacion } from "../../lib/logic/notificación";

  //creamos una variable para almacenar el evento
  let evento: evento = {
    nombre: "",
    descripcion: "",
    dia: "",
    hora: "",
    imagen:
      "https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Restaurantes%2Fnot-found-icon-4.jpg?alt=media&token=5b0a8e01-c4b6-4218-8983-bbc4648cbf67",
    participantes: 0,
    maxParticipantes: 0,
    visible: false,
    precio: 0,
    visibleAdministrador: true,
  };

  let currentid = "";
  onMount(async () => {
    //obtenemos el evento
    eventoStore.subscribe((value) => {
      evento = value;
      console.log(evento);
      if (evento == null) {
        console.log("No hay evento");
      }
    });
    //obttenemos el valor del current id
    idEvento.subscribe((value) => {
      currentid = value;
      console.log(currentid);
    });
  });

  //creamos un tipo de dato notificaión
  let notificacion: Notificacion = {
    uidEvento: currentid,
    nombreEvento: evento.nombre,
    mensaje: "",
    fecha: new Date().toLocaleDateString(),
    viable: true,
  };

  //funciones para el adicionamiento de participantes
  const participar = () => {
    evento.participantes++;
    //comprobamps que el numero de participantes no sea mayor al maximo
    if (evento.participantes > evento.maxParticipantes) {
      evento.participantes--;
      notificacion.uidEvento = currentid;
      notificacion.nombreEvento = evento.nombre;
      notificacion.mensaje =
        "No hay mas cupos disponibles en este evento por lo que las personas no pueden participar";
      addNotificacion();
      showMistake("No hay mas cupos disponibles");
      return;
    }
    if (evento.participantes == evento.maxParticipantes) {
      notificacion.mensaje =
        "El evento ha alcanzado el numero maximo de participantes por lo que las personas no pueden participar";
      addNotificacion();
    }
    eventoStore.set(evento);
    console.log(evento);
    addParticipante();
    actualizar();
    availableParticipation = false;
  };

  //función para actualizar la base de datos
  const actualizar = async () => {
    try {
      await updateDoc(doc(db, "Eventos", currentid), evento);
    } catch (error) {
      console.log(error);
    }
  };

  //creamos una variable de tipo Participacion
  let participacion: Participacion = {
    uidParticipante: "",
    uidEvento: "",
  };

  //funciones para añadir el participante a la base de datos
  const addParticipante = async () => {
    try {
      participacion.uidParticipante = $user.uid;
      participacion.uidEvento = currentid;
      const docRef = await addDoc(
        collection(db, "participantes"),
        participacion
      );
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  //funciones para añadir notificaciones
  const addNotificacion = async () => {
    try {
      const docRef = await addDoc(
        collection(db, "notificaciones"),
        notificacion
      );
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  //funciones para garantizar un solo participante
  //creamos una variabla para almacenar las participaciones sin filtrar del usuario de la base de datos
  let participantesSinFiltrar: any[] = [];
  //creamos una variable para almacenar las participaciones del usuario
  let participantes: any[] = [];
  //variable par habilitar o deshabilitar el boton de participar
  let availableParticipation = true;

  const unsub2 = onSnapshot(
    collection(db, "participantes"),
    (querySnapshot) => {
      participantes = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });
      //guardamos las participaciones sin filtrar
      participantesSinFiltrar = participantes;

      //Vamos a filtrar los participantes hasta el punto de solo dejar los que pertenecen al usuario
      participantes = participantesSinFiltrar.filter((participacion) => {
        return participacion.uidParticipante == $user.uid;
      });

      //vamos a filtrar pero en base al evento actual para saber si el usuario esta participando en este evento
      participantes = participantes.filter((participacion) => {
        return participacion.uidEvento == currentid;
      });

      //comprobamos
      if (participantes.length > 0) {
        console.log("Ya estas participando en este evento");
        availableParticipation = false;
      } else {
        console.log("No estas participando en este evento");
      }
    },
    (error) => {
      console.log(error);
    }
  );

  onDestroy(() => {
    unsub2();
  });

  const available = () => {
    //traemos la base de datos de participantes
  };

  //funciones para mostrar notificaciones
  const showMistake = (message: string) => {
    //crear notificacion de error
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "center",
      backgroundColor: "linear-gradient(to right, #ff416c, #ff4b2b)",
      stopOnFocus: true,
    }).showToast();
  };
</script>

<body>
  <header class="header">
    <div class="header-content container">
      <div class="header-txt">
        <h1 class="neon">EVENTOS</h1>
        <p>información acerca del evento</p>
      </div>
    </div>
  </header>

  <div class="Medina">
    <h1>Evento: {evento.nombre}</h1>
    <h1>{currentid}</h1>
  </div>

  <section class="containerEventos color-change-3x">
    <div class="container">
      <div class="containerEventos-txt">
        <div class="event-image">
          <img
            src={evento.imagen}
            alt="Imagen del evento"
            style="width: 20%; height: 20%;"
          />
        </div>
        <div class="event-details">
          <h1 style="text-transform: uppercase;">{evento.nombre}</h1>
          <p>El evento consta de: {evento.descripcion}</p>
          <p>Se llevará a cabo: {evento.dia} {evento.hora}</p>
          <p>
            Participantes actuales: {evento.participantes} Participantes maximos:
            {evento.maxParticipantes}
          </p>
          <p>Si deseas participar puedes hacerlo desde el boton de abajo</p>
        </div>
      </div>
    </div>
  </section>

  <div class="btn-border">
    <!--Boton para participar-->
    {#if availableParticipation}
      <button on:click={participar} class="btn">¿Quieres Participar?</button>
    {:else}
      <button disabled class="btn-2">Ya estas participando</button>
    {/if}
  </div>
</body>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap");

  @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap");

  @import url("https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap");

  * {
    font-family: "Poppins", sans-serif;
  }
  body {
    background: -webkit-linear-gradient(
      -180deg,
      rgb(22, 135, 237),
      rgb(8, 37, 67)
    );
    background: linear-gradient(-180deg, rgb(22, 135, 237), rgb(8, 37, 67));
  }

  .header {
    background-color: #082543;
    background-position: center bottom;
    background-repeat: no-repeat;
    background-size: cover;
    min-height: 70vh;
    align-items: center;
    display: flex;
    padding-top: 50px;
  }

  .header-txt {
    padding-top: 10px;
    text-align: center;
    margin-left: 200px;
  }

  .header-txt h1 {
    font-size: 85px;
    color: #fff;
    text-transform: uppercase;
    margin-bottom: 20px;
    animation: fadeInUp 1s ease 0.5s; /* Agregamos una animación fadeInUp con un retraso */
  }

  .header-txt p {
    color: #fff;
    font-size: 20px;
    padding: 0 250px;
    margin-bottom: 45px;
    animation: fadeInUp 1s ease 0.5s; /* Agregamos una animación fadeInUp con un retraso */
  }
  /* Animación fadeInUp */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .neon {
    font-size: 6em;
    font-weight: 500;
    color: #fff;
    text-shadow: 0 0 5px #03e9f4, 0 0 25px #03e9f4, 0 0 50px #03e9f4,
      0 0 100px #03e9f4;
    letter-spacing: 5px;
    cursor: pointer;
    text-transform: uppercase;
    transition: 1s;
  }

  .neon:hover {
    color: #fff;
    text-shadow: 0 0 100px #03e9f4, 0 0 25px #03e9f4, 0 0 50px #03e9f4,
      0 0 100px #03e9f4;
  }

  .container {
    display: flex;
    justify-content: space-between; /* Distribuir el contenido horizontalmente */
    align-items: center; /* Centrar verticalmente el contenido */
    padding: 20px; /* Espaciado opcional */
  }

  .containerEventos {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px solid black;
    border-radius: 5px;
    margin: 10px;
    padding: 10px;
  }

  .Medina {
    display: none;
  }

  .containerEventos-txt {
    display: flex;
    flex-direction: row; /* Colocar elementos en fila */
    align-items: center; /* Centrar verticalmente los elementos */
    width: 100%; /* Ocupar todo el ancho disponible */
    color: #fff;
  }

  .event-details {
    flex: 1; /* Ocupar la mitad izquierda */
  }

  .event-image {
    flex: 1; /* Ocupar la mitad derecha */
    text-align: center; /* Centrar la imagen horizontalmente */
  }

  .event-image img {
    min-height: 300px;
    min-width: 300px;
    max-width: 100%; /* Asegurarse de que la imagen no se desborde */
    height: auto; /* Mantener la proporción de aspecto de la imagen */
  }

  .btn-border {
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
  }

  /* Estilos para los botones */
  .btn,
  .btn-2 {
    padding: 10px 20px; /* Ajusta el padding según tus necesidades */
    /* Otros estilos de los botones */
  }

  .btn,
  .btn-2 {
    border: none;
    margin-left: 30px;
    background: #a37125;
    padding: 10px 20px;
    border-radius: 30px;
    color: #fff;
    font-weight: bold;
    font-size: 15px;
    transition: 0.4s;
  }

  .btn:hover {
    color: #30a6ff;
    transform: scale(1.1);
    cursor: pointer;
  }

  .btn::after {
    color: #f0726c;
  }

  .btn-2 {
    background-color: #f0726c;
  }

  .color-change-3x {
    -webkit-animation: color-change-3x 4s linear infinite alternate both;
    animation: color-change-3x 4s linear infinite alternate both;
  }

  /* ----------------------------------------------
 * Generated by Animista on 2023-8-22 21:21:0
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

  /**
 * ----------------------------------------
 * animation color-change-3x
 * ----------------------------------------
 */
  @-webkit-keyframes color-change-3x {
    0% {
      background: #0a3f6e;
    }
    50% {
      background: #1687ed;
    }
    100% {
      background: #116bba;
    }
  }
  @keyframes color-change-3x {
    0% {
      background: #0a3f6e;
    }
    50% {
      background: #1687ed;
    }
    100% {
      background: #116bba;
    }
  }

  .containerEventos:hover {
    transform: translateY(-5px);
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  }
</style>
