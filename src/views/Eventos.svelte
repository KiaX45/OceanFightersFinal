<script lang="ts">
  /**
   * @version 1.0.0
   * @description Este componente se encarga de mostrar los eventos que se han registrado en la aplicación
   * tambien se va a encargar de poder adicionar nuevos eventos y editar los ya existentes
   * sin la necesidad de tener que ir a otra pestaña para los administradores
   */

  //importamos las stores de usuarios y de administradores
  import { user, admin } from "../stores/User";

  //importamos los tipos de datos necesarios
  import type { evento } from "../lib/logic/eventos";

  //importamos los modulos neccesarios para mostrar notificaciones
  import { db } from "../firebase";
  import {
    addDoc,
    collection,
    onSnapshot,
    updateDoc,
    doc,
  } from "firebase/firestore";

  //importamos los modulos necesarios para subir imagenes
  import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
  import { storage } from "../firebase";

  //importamos los modulos necesarios para mostrar notificaciones de toastify
  import Toastify from "toastify-js";

  //importamos ondestroy para dejar de escuchar los cambios
  import { onDestroy } from "svelte";

  //importamos las stores necesarias
  import { eventoStore, idEvento } from "../stores/Evento";

  //Importamos los modulos de svelte routing
  import { navigate } from "svelte-routing";

  //funciones para crear eventos

  //creamos una variable de tipo evento para guardar la información del formulario
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

  //variable para saber cuando se esta editando un evento
  let onEdit: boolean = false;

  //funcion para enviar el formulario
  const handleSubmit = () => {
    //Comprobamos si hay una imagen seleccionada
    if (selectedImage) {
      uploadFile(selectedImage);
    } else {
      //comprobamos si se esta editando un evento
      if (onEdit) {
        //actualizamos el evento
        updateEvento();
        return;
      }
      //llamamos a la función para subir los datos
      addEvento();
    }
  };

  //variable para mostrar imagen de previsualización
  let showimagePreview: boolean = false;
  //funciones para la subida de imagenes
  //Creamos funciones para el procesamiento de imagenes
  //Variable que almacenara la imagen seleccionada
  let selectedImage: File | undefined;
  //Función para seleccionar la imagen
  function handleImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      selectedImage = input.files[0];
      console.log(selectedImage);
      showimagePreview = true;
      console.log(showimagePreview);
    }
  }
  //Función para subir la imagen

  let resultImage: string | undefined;

  async function uploadFile(file) {
    const storageRef = ref(storage, `Avistamientos/${evento.nombre}`);
    await uploadBytes(storageRef, file);
    resultImage = await getDownloadURL(storageRef);
    console.log(resultImage);
    if (resultImage) {
      evento.imagen = resultImage;
    }

    //Comprobamos si el usuario lleno correctamente el formulario
    if (!checkForm()) {
      showMistake(
        "Se deben llenar todos los campos antes de subir un nuevo evento"
      );
      return;
    }

    //comprobamos si se esta editando un evento
    if (onEdit) {
      //actualizamos el evento
      updateEvento();
      return;
    }

    //llamamos a la función para subir los datos
    addEvento();
  }

  //funcion para comprobar si el usuario lleno correctamente el formulario
  const checkForm = () => {
    if (
      evento.nombre == "" ||
      evento.descripcion == "" ||
      evento.dia == "" ||
      evento.hora == "" ||
      evento.imagen == ""
    ) {
      return false;
    } else {
      return true;
    }
  };

  //funcion para mostrar notificaciones
  const showMistake = (message: string) => {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff0000",
      stopOnFocus: true,
    }).showToast();
  };

  //funcion para subir los datos a la base de datos
  const addEvento = async () => {
    if (evento.participantes > evento.maxParticipantes) {
      showMistake(
        "El numero de participantes no puede ser mayor al maximo de participantes"
      );
      return;
    }
    try {
      //comprobamos si el evento tiene todos los parametros llenos
      if (checkForm() == false) {
        showMistake(
          "Se deben llenar todos los campos antes de subir un nuevo evento"
        );
        return;
      }

      //comprobamos si el maximo de participantes es 0
      if (evento.maxParticipantes == 0) {
        showMistake(
          "El maximo de participantes es 0 por lo que no se pondra visible el evento"
        );
        evento.visible = false;
      }
      if (!checkDate(evento)) {
        //si no esta vigente le mostramos una notificaión de advertencia
        showMistake(
          "El evento que editaste ya no esta vigente, por lo tanto no se mostrara en la pagina de eventos para los usuarios"
        );
        evento.visible = false;
      } else {
        //si esta vigente le mostramos una notificación de exito
        Toastify({
          text: "El evento se añadio correctamente",
          duration: 3000,
          gravity: "top",
          position: "center",
          backgroundColor: "#00ff00",
          stopOnFocus: true,
        }).showToast();
      }

      console.log(evento.visible);

      const docRef = await addDoc(collection(db, "Eventos"), evento);
      //addDoc es un elemento propio de firebase para añadir documentos a la base de datos tenemos que enviar por parametros el db que lo importamos anteriormente y el nombre de la coleccion en la que queremos guardar el documento adicional a esto le enviamos el objeto que queremos guardar si no hay una colección con el nombre que le enviamos se creara una nueva y si ya existe se añadira el documento a la colección
      console.log("Document written with ID: ", docRef.id);
      //Se reestablece el formulario
      resetForm();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    showimagePreview = false;
  };

  //funciones para reestablecer el formulario
  const resetForm = () => {
    evento = {
      nombre: "",
      descripcion: "",
      dia: "",
      hora: "",
      imagen: "",
      participantes: 0,
      maxParticipantes: 0,
      visible: false,
      precio: 0,
    };
  };

  //funciones para poder obtener los datos de la base de datos
  //creamos una variable para almacenar los eventos
  let eventos: any[] = [];
  //creamos una variable para almacenar los eventos sin filtrar
  let eventosSinFiltrar: any[] = [];
  const unsub = onSnapshot(
    collection(db, "Eventos"),
    (querySnapshot) => {
      eventos = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });
      //guardamos los avistamientos sin filtrar
      eventosSinFiltrar = eventos;

      //vamos a filtrrar los avistamientos en base a la fecha de los avistamientos dejando de primero los mas recientes
      eventos = eventosSinFiltrar.sort((a, b) => {
        return (
          new Date(b.dia + " " + b.hora).getTime() -
          new Date(a.dia + " " + a.hora).getTime()
        );
      });

      //ka siguiente comprobaión solo se debe hacer si el usuario no es administrador
      if ($user && !$admin) {
        //vamos a filtrar los eventos para que solo se muestren los que esten vigentes
        eventos = eventosSinFiltrar.filter((evento) => {
          return checkDate(evento);
        });

        //vamos a filtrar solo los eventos visibles
        eventos = eventosSinFiltrar.filter((evento) => {
          return evento.visible;
        });
      }

      //comprobamos
      console.log(eventos);
    },
    (error) => {
      console.log(error);
    }
  );

  //Vamos a dejar de que escuche los cambios
  onDestroy(() => {
    unsub();
  });

  //función para comprobar si un evento sigue estando vigenete
  const checkDate = (evento: evento) => {
    //obtenemos la fecha actual
    let fechaActual = new Date();
    //obtenemos la fecha del evento
    let fechaEvento = new Date(evento.dia + " " + evento.hora);
    //comparamos las fechas
    if (fechaActual.getTime() > fechaEvento.getTime()) {
      return false;
    } else {
      return true;
    }
  };

  let currentid: any = "";

  const onEditEvent = (eventoonEdit: any) => {
    //cambiamos el valor de la variable onEdit
    onEdit = true;
    //cambiamos el valor de la variable evento
    evento = eventoonEdit;
    //guardamos el id del evento
    currentid = eventoonEdit.id;
  };

  //funcion para actualizar los datos de un evento
  const updateEvento = async () => {
    try {
      //comprobamos si el numero de participantes es mayor al maximo de participantes
      if (evento.participantes > evento.maxParticipantes) {
        showMistake(
          "El numero de participantes no puede ser mayor al maximo de participantes"
        );
        return;
      }
      //comprobamos si el maximo de participantes es 0
      if (evento.maxParticipantes == 0) {
        showMistake(
          "El maximo de participantes es 0 por lo que no se pondra visible el evento"
        );
        evento.visible = false;
      }
      //comprobamos si el evento editado esta vigente
      if (!checkDate(evento)) {
        //si no esta vigente le mostramos una notificaión de advertencia
        showMistake(
          "El evento que editaste ya no esta vigente, por lo tanto no se mostrara en la pagina de eventos para los usuarios"
        );
        evento.visible = false;
      } else {
        //si esta vigente le mostramos una notificación de exito
        Toastify({
          text: "El evento se actualizo correctamente",
          duration: 3000,
          gravity: "top",
          position: "center",
          backgroundColor: "#00ff00",
          stopOnFocus: true,
        }).showToast();
      }

      console.log(evento.visible);

      await updateDoc(doc(db, "Eventos", currentid), evento);
      console.log("Document successfully updated!");
      //cambiamos el valor de la variable onEdit
      onEdit = false;
      //reestablecemos el formulario
      resetForm();
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  //funciones para ingresar un evento en la store
  const gotoEvento = (evento: any) => {
    eventoStore.set(evento);
    idEvento.set(evento.id);
    console.log(evento.id);
    navigate("/evento");
  };

  //funciones para ocultar y mostrar evenetos
  const showOrHideEvent = (eventoShoworHide) => {
    if (eventoShoworHide) {
      //comprobamos si es vigente o no
      if (!checkDate(eventoShoworHide)) {
        //si no esta vigente le mostramos una notificaión de advertencia
        showMistake(
          "El evento que editaste ya no esta vigente, por lo tanto no se mostrara en la pagina de eventos para los usuarios"
        );
        return;
      }
      //corroboramos que el maximo de participantes no sea cero
      if (eventoShoworHide.maxParticipantes == 0) {
        showMistake(
          "El maximo de participantes es 0 por lo que no se pondra visible el evento"
        );
        return;
      }
    }

    currentid = eventoShoworHide.id;
    evento = eventoShoworHide;
    evento.visible = !evento.visible;
    updateEvento();
  };
</script>

<!--Apartado para mostrar los eventos previamente creados-->
{#each eventos as evento}
  <div class="containerEventos">
    <h1>{evento.nombre}</h1>
    <p>{evento.dia}</p>
    <img
      src={evento.imagen}
      alt="Imagen del evento"
      style="width: 20%; height: 20%;"
    />
    {#if $admin}
      <button on:click={() => onEditEvent(evento)}>Editar</button>
      {#if evento.visible}
        <button on:click={() => showOrHideEvent(evento)}>Ocultar</button>
      {:else}
        <button on:click={() => showOrHideEvent(evento)}>Mostrar</button>
      {/if}
    {:else}
      <button on:click={() => gotoEvento(evento)}>Mas información</button>
    {/if}
  </div>
{/each}

<!--Apartado solo para los administradores paea adicionar un nuevo evento-->
{#if $admin}
  <form on:submit|preventDefault={handleSubmit}>
    <label>
      Nombre:
      <input type="text" bind:value={evento.nombre} />
    </label>

    <label>
      Descripción:
      <textarea bind:value={evento.descripcion} />
    </label>

    <label>
      Día:
      <input type="date" bind:value={evento.dia} class="flatpickr-input" />
    </label>

    <label>
      Hora:
      <input type="time" bind:value={evento.hora} class="flatpickr-time" />
    </label>

    <div class="file-input-container">
      <label for="imagen">Imagen:</label>
      <input
        type="file"
        on:change|preventDefault={handleImageSelect}
        accept="image/*"
      />
    </div>

    <label>
      Participantes:
      <input type="number" bind:value={evento.participantes} />
    </label>

    <label>
      Maximo de participantes:
      <input type="number" bind:value={evento.maxParticipantes} />
    </label>

    <label>
      Visible:
      <input type="checkbox" bind:checked={evento.visible} />
    </label>

    <button type="submit">Enviar</button>
  </form>

  <!--Apartado para la imagen de previsualización-->
  {#if showimagePreview}
    <div style="justify-content: center; align-items: center;">
      <img
        src={URL.createObjectURL(selectedImage)}
        alt="Imagen seleccionada"
        style="width: 70%; height: 70%;  margin: 1"
      />
    </div>
  {/if}
{/if}

<style>
  /*Estilos para los eventos*/
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

  /*Estilos delformulario*/

  form {
    max-width: 400px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f7f7f7;
  }

  label,
  input {
    display: block;
    margin-bottom: 10px;
  }

  label {
    font-weight: bold;
  }

  input,
  textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 16px;
  }

  textarea {
    resize: vertical;
  }

  input[type="checkbox"] {
    margin-right: 5px;
  }

  button {
    padding: 10px 15px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 16px;
  }

  button:hover {
    background-color: #45a049;
  }

  .flatpickr-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 16px;
  }

  /* Estilos para el selector de hora */
  .flatpickr-time {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 16px;
  }
</style>
