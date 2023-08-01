<script lang="ts">
  //vamos aimportar las store de eventos
  import { eventoStore, idEvento } from "../../stores/Evento";

  //importamos onMount para que se ejecute cuando se monte el componente
  import { onMount } from "svelte";

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

  //funciones para el adicionamiento de participantes
  const participar = () => {
    evento.participantes++;
    eventoStore.set(evento);
    console.log(evento);
    actualizar();
  };

  //función para actualizar la base de datos
  const actualizar = async () => {
    try {
        await updateDoc(doc(db, "Eventos", currentid), evento);
    } catch (error) {
      console.log(error);
    }
  };

  //funciones para garantizar un solo participante

  const available = () => {
    //traemos la base de datos de participantes
  };

</script>

<h1>{evento.nombre}</h1>

<!--Boton para participar-->
<button on:click={participar}>¿Quieres Participar?</button>

<style>
</style>
