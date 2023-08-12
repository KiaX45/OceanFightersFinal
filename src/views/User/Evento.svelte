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

<h1>{evento.nombre}</h1>
<h1>{currentid}</h1>

<!--Boton para participar-->
{#if availableParticipation}
  <button on:click={participar}>¿Quieres Participar?</button>
{:else}
  <button disabled>Ya estas participando</button>
{/if}

<style>
</style>
