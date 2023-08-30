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
  import { onDestroy, onMount } from "svelte";

  //importamos las stores necesarias
  import { eventoStore, idEvento } from "../stores/Evento";

  //Importamos los modulos de svelte routing
  import { navigate } from "svelte-routing";
  import { get } from "svelte/store";

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
    visibleAdministrador: true,
  };

  //variable para saber cuando se esta editando un evento
  let onEdit: boolean = false;

  //funcion para enviar el formulario
  const handleSubmit = () => {
    //Comprobamos si hay una imagen seleccionada
    if (selectedImage != undefined) {
      console.log("No deberia entrar aqui");
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
    //Comprobamos si ya hay una imagen sin la necesidad del seleccionador

    //obtenemos la url de la imagen
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
      imagen:
        "https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Restaurantes%2Fnot-found-icon-4.jpg?alt=media&token=5b0a8e01-c4b6-4218-8983-bbc4648cbf67",
      participantes: 0,
      maxParticipantes: 0,
      visible: false,
      precio: 0,
      visibleAdministrador: true,
    };
    selectedImage = undefined;
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
      //Comprobamos que solo se muestren los que visibles para los administradores
      eventos = eventosSinFiltrar.filter((evento) => {
        return evento.visibleAdministrador;
      });

      //la siguiente comprobaión solo se debe hacer si el usuario no es administrador
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
    getParticipantes();
    getUsuarios();
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
    //la imagen del evento se debe guardar en la variable selectedImage
    console.log(evento.imagen);
    console.log(selectedImage);
    //mostramos la imagen de previsualización
    //showimagePreview = true;

    //Vamos a extraer los correos de las personas que estan inscritas en este evento
  };

  //Función para extraer los correos de las personas que estan inscritas en este evento
  //creamos una variable para almacenar los correos
  let correos: any[] = [];
  let participantes2: any[] = [];

  const getParticipantes = onSnapshot(
    collection(db, "participantes"),
    (querySnapshot) => {
      participantes2 = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });
    },
    (error) => {
      console.log(error);
    }
  );

  let usuarios: any[] = [];
  let usuariosSinFiltrar: any[] = [];
  const getUsuarios = onSnapshot(
    collection(db, "Usuarios"),
    (querySnapshot) => {
      usuarios = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });
      //guardamos los avistamientos sin filtrar
      usuariosSinFiltrar = usuarios;
      console.log(usuarios);
    },
    (error) => {
      console.log(error);
    }
  );

  const getCorreos = (evnetoCorreosid) => {
    console.log(participantes2);
    console.log(evnetoCorreosid);
    console.log(usuarios);
    //vamos a filtrrar los participantes para que solo salgan los correos de los que estan participando en el evento a editar
    participantes2 = participantes2.filter((participante) => {
      return participante.uidEvento == evnetoCorreosid;
    });
    console.log(participantes2);

    //vamos a extraer los correos de los participantes
    participantes2.forEach((participante) => {
      //vamos a filtrar los usuarios para que solo salgan los que estan participando en el evento a editar
      usuarios = usuariosSinFiltrar.filter((usuario) => {
        return usuario.uid == participante.uidParticipante;
      });
      //vamos a extraer los correos de los usuarios
      usuarios.forEach((usuario) => {
        correos.push(usuario.email);
      });
    });

    //si el coreo esta repetido se elimina
    correos = correos.filter((correo, index) => {
      return correos.indexOf(correo) === index;
    });

    console.log(correos);
    return correos;
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
        //comprobamos si se esta eliminando un evento
        if (onDeleting) {
          //si se esta eliminando un evento le mostramos una notificación de exito
          //el color del background es amarillo para que se diferencie de las notificaciones de exito
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
      }

      console.log(evento.visible);

      await updateDoc(doc(db, "Eventos", currentid), evento);
      console.log("Document successfully updated!");
      //Obtenemos los correos de los participantes
      //console.log(getCorreos(currentid));
      let correos5 = getCorreos(currentid);
      console.log(correos5.length);
      for (let index = 0; index < correos5.length; index++) {
        console.log(correos5[index]);
        //sendNotification(correos5[index]);
        console.log(index)
      }

      //cambiamos el valor de la variable onEdit
      onEdit = false;
      //reestablecemos el formulario
      resetForm();
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////
  import * as emailjs from "emailjs-com";

  let email = "oceanfightersofficial@gmail.com"; // Variable con el correo por defecto
  let mensaje = "Hubo una modificacion en uno de sus Eventos"; // Variable con el mensaje por defecto
  let name = "Ocean Fighters"; // Variable con el nombre por defecto

  const sendNotification = async (correoenviar) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("FUNCION");
    //console.log("OBJETO", usuarios);
    console.log("PASO A LA FUNCION" + correoenviar);
    const e = {
      email: correoenviar,
      mensaje: mensaje,
      name: name,
    };
    console.log("OBJETO", e);
    sendEmail(e);

   // alert("Notificación enviada");
    mensaje = "";
  };

  function sendEmail(e) {
    console.log("FUNCION");
    console.log("OBJETO", e);
    emailjs
      .send("service_ujz2xlc", "template_55iycxs", e, "IQK-_LSRVvit9Nnr_")
      .then(
        (result) => {
          console.log("SUCCESS!", result.text);
        },
        (error) => {
          console.log("FAILED...", error.text);
        }
      );
  }
  ////////////////////////////////////////////////////////////////////////////////////////

  //funciones para ingresar un evento en la store
  const gotoEvento = (evento: any) => {
    //comprobamos si el usuario esta registrado
    if (!$user) {
      showMistake("Debes iniciar sesión para participar en los eventos");
      navigate("/login");
      return;
    }
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
  //Variable para saber cuando se esta eliminando un evento
  let onDeleting: boolean = false;
  //Funciones para eliminar eventos
  const eliminarEvento = (evento) => {
    //comprobamos si el evento esta vigente y tiene participantes
    if (checkDate(evento) && evento.participantes > 0) {
      showMistake(
        "El evento tiene participantes por lo que no se puede eliminar"
      );
      return;
    }
    onDeleting = true;
    //Editamos la propiedad visibleAdministrador
    evento.visibleAdministrador = false;
    //Editamos la visibilidad de los usuarios
    evento.visible = false;
    //Actualizamos el evento
    try {
      updateDoc(doc(db, "Eventos", evento.id), evento);
      Toastify({
        text: "El evento se elimino correctamente",
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "#F4D03F",
        color: "#000000",
        stopOnFocus: true,
      }).showToast();
      onDeleting = false;
      console.log("Document successfully updated!");
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  //funciones para cambiar el estado de visibilidad a los eventos que ya no son viables
  const changeVisibility = () => {
    //obtenemos la fecha actual
    let fechaActual = new Date();
    //recorremos los eventos
    console.log(eventos);
    eventos.forEach((evento) => {
      //obtenemos la fecha del evento
      let fechaEvento = new Date(evento.dia + " " + evento.hora);
      //comparamos las fechas
      if (fechaActual.getTime() > fechaEvento.getTime()) {
        //si la fecha actual es mayor a la fecha del evento cambiamos la visibilidad del evento
        evento.visible = false;
        //actualizamos el evento
        try {
          updateDoc(doc(db, "Eventos", evento.id), evento);
          console.log("Document successfully updated!");
        } catch (e) {
          console.error("Error updating document: ", e);
        }
      }
    });
  };

  //Funcion onMount
  onMount(() => {
    //creamos un await de tres segundos para que se llene el arreglo de los eventos
    setTimeout(() => {
      console.log("Se ejecuto el setTimeout");
      //Cambiamos la visibilidad de los eventos que ya no son viables
      changeVisibility();
    }, 3000);
  });
</script>

<body>
  <header class="header">
    <div class="header-content container">
      <div class="header-txt">
        <h1 class="neon text-pop-up-top">EVENTOS</h1>
        <p>
          Comprobar los lugares de los avistamientos
        </p>
      </div>
    </div>
  </header>

  <!--Apartado para mostrar los eventos previamente creados-->
  {#each eventos as evento}
    <section class="containerEventos">
      <div class="container">
        <div class="containerEventos-txt">
          <div class="event-details">
            <h1 style="text-transform: uppercase;">{evento.nombre}</h1>
            <p>{evento.descripcion}</p>
            <p>{evento.dia} {evento.hora}</p>
            <p>
              Participantes actuales: {evento.participantes} Participantes maximos:
              {evento.maxParticipantes}
            </p>
          </div>
          <div class="event-image">
            <img
              src={evento.imagen}
              alt="Imagen del evento"
              style="width: 20%; height: 20%;"
            />
          </div>
        </div>
      </div>
      <div>
        {#if $admin}
          <button on:click={() => onEditEvent(evento)}>Editar</button>
          {#if evento.visible}
            <button on:click={() => showOrHideEvent(evento)}>Ocultar</button>
          {:else}
            <button on:click={() => showOrHideEvent(evento)}>Mostrar</button>
          {/if}
          <button on:click={() => eliminarEvento(evento)}>Eliminar</button>
        {:else}
          <button on:click={() => gotoEvento(evento)}>Mas información</button>
        {/if}
      </div>
    </section>
  {/each}

  {#if $admin}
    <section>
      <h2
        class="neon"
        style="font-size: 40px; margin-top:30px; margin-bottom:30px; margin-left:33%"
      >
        Agregar eventos
      </h2>
      <div class="container">
        <!--Apartado solo para los administradores paea adicionar un nuevo evento-->

        <div class="container-form">
          <form on:submit|preventDefault={handleSubmit}>
            <label>
              Nombre:
              <input type="text" bind:value={evento.nombre} />
            </label>
            <label
              >Descripción: <textarea bind:value={evento.descripcion} />
            </label>
            <label
              >Día:<input
                type="date"
                bind:value={evento.dia}
                class="flatpickr-input"
              />
            </label>
            <label>
              Hora:
              <input
                type="time"
                bind:value={evento.hora}
                class="flatpickr-time"
              />
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
        </div>

        <!--Apartado para la imagen de previsualización-->
        {#if showimagePreview && selectedImage != undefined}
          <div class="container-form-image">
            <h3>Previsualización de la imagen</h3>
            <img
              class="pulsate-bck"
              src={URL.createObjectURL(selectedImage)}
              alt="Imagen seleccionada"
            />
          </div>
        {/if}
      </div>
    </section>
  {/if}
</body>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap");

  @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap");

  @import url("https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap");

  *{
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

  /*Estilos para los eventos MEDINA*/
  .containerEventos {
    background-image: url(https://plustatic.com/4059/conversions/diferencias-mar-oceano-social.jpg);
    background-repeat: no-repeat;
    background-size: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px solid black;
    border-radius: 5px;
    margin: 10px;
    padding: 10px;
    min-height: 80vh;
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
    background-color: #a37125;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 16px;
    transition: 0.4s;
  }

  button:hover {
    color: #a37125;
    background-color: #efbc70;
    transform: scale(1.1);
    cursor: pointer;
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

  .container-form {
    min-width: 500px;
    height: auto;
  }

  .container-form-image h3 {
    color: #fff;
    margin: 30px;
  }

  .pulsate-bck {
    -webkit-animation: pulsate-bck 4s ease-in-out infinite both;
    animation: pulsate-bck 4s ease-in-out infinite both;
  }

  /* ----------------------------------------------
 * Generated by Animista on 2023-8-14 20:56:6
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

  /**
 * ----------------------------------------
 * animation pulsate-bck
 * ----------------------------------------
 */
  @-webkit-keyframes pulsate-bck {
    0% {
      -webkit-transform: scale(1);
      transform: scale(1);
    }
    50% {
      -webkit-transform: scale(0.9);
      transform: scale(0.9);
    }
    100% {
      -webkit-transform: scale(1);
      transform: scale(1);
    }
  }
  @keyframes pulsate-bck {
    0% {
      -webkit-transform: scale(1);
      transform: scale(1);
    }
    50% {
      -webkit-transform: scale(0.9);
      transform: scale(0.9);
    }
    100% {
      -webkit-transform: scale(1);
      transform: scale(1);
    }
  }

  .text-pop-up-top {
    -webkit-animation: text-pop-up-top 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)
      both;
    animation: text-pop-up-top 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  /* ----------------------------------------------
 * Generated by Animista on 2023-8-22 21:16:38
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

  /**
 * ----------------------------------------
 * animation text-pop-up-top
 * ----------------------------------------
 */
  @-webkit-keyframes text-pop-up-top {
    0% {
      -webkit-transform: translateY(0);
      transform: translateY(0);
      -webkit-transform-origin: 50% 50%;
      transform-origin: 50% 50%;
      text-shadow: none;
    }
    100% {
      -webkit-transform: translateY(-50px);
      transform: translateY(-50px);
      -webkit-transform-origin: 50% 50%;
      transform-origin: 50% 50%;
      text-shadow: 0 1px 0 #cccccc, 0 2px 0 #cccccc, 0 3px 0 #cccccc,
        0 4px 0 #cccccc, 0 5px 0 #cccccc, 0 6px 0 #cccccc, 0 7px 0 #cccccc,
        0 8px 0 #cccccc, 0 9px 0 #cccccc, 0 50px 30px rgba(0, 0, 0, 0.3);
    }
  }
  @keyframes text-pop-up-top {
    0% {
      -webkit-transform: translateY(0);
      transform: translateY(0);
      -webkit-transform-origin: 50% 50%;
      transform-origin: 50% 50%;
      text-shadow: none;
    }
    100% {
      -webkit-transform: translateY(-50px);
      transform: translateY(-50px);
      -webkit-transform-origin: 50% 50%;
      transform-origin: 50% 50%;
      text-shadow: 0 1px 0 #cccccc, 0 2px 0 #cccccc, 0 3px 0 #cccccc,
        0 4px 0 #cccccc, 0 5px 0 #cccccc, 0 6px 0 #cccccc, 0 7px 0 #cccccc,
        0 8px 0 #cccccc, 0 9px 0 #cccccc, 0 50px 30px rgba(0, 0, 0, 0.3);
    }
  }

  .containerEventos:hover {
    transform: translateY(-5px);
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  }
  
</style>
