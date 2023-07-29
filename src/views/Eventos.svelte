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

  //funciones para crear eventos

  //creamos una variable de tipo evento para guardar la información del formulario
  let evento: evento = {
    nombre: "",
    descripcion: "",
    dia: "",
    hora: "",
    imagen: "https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Restaurantes%2Fnot-found-icon-4.jpg?alt=media&token=5b0a8e01-c4b6-4218-8983-bbc4648cbf67",
    participantes: 0,
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
    try {
      //comprobamos si el restaurante tiene todos los parametros llenos
      if (checkForm() == false) {
        showMistake(
          "Se deben llenar todos los campos antes de subir un nuevo evento"
        );
        return;
      }
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
      visible: false,
      precio: 0,
    };
  };
</script>

<!--Apartado para mostrar los eventos previamente creados-->

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
      Visible:
      <input type="checkbox" bind:checked={evento.visible} />
    </label>

    <label>
      Precio:
      <input type="number" step="0.01" bind:value={evento.precio} />
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
