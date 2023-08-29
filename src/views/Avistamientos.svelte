<script lang="ts">
  //importamos las stores de usuarios
  import { user, admin } from "../stores/User";

  //importamos los modulos necesarios para conectarnos con la base de datos
  import { db } from "../firebase";
  import {
    addDoc,
    collection,
    onSnapshot,
    updateDoc,
    doc,
  } from "firebase/firestore";

  //importamos los modulos necesarios para mostrar notificaciones
  import Toastify from "toastify-js";

  //importamos los modulos para el reedireccionamiento desde svelteRouting
  import { navigate } from "svelte-routing";

  //importamos el tipo de dato avistamiento
  import type { Avistamiento } from "../lib/logic/avistamiento";

  //importamos lo necesario para el procesamiento de imagenes
  import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
  import { storage } from "../firebase";
  import { signOut } from "firebase/auth";

  //impotamos onmount y ondestroy
  import { onMount, onDestroy } from "svelte";

  //variable que nos permitira ocultar o mostrar el boton de subida de imagenes
  let availableUpload = false;

  //Creamos una variable de dato que nos permitira almacenar los datos del formulario
  let avistamiento: Avistamiento = {
    nombre: "",
    fecha: "",
    hora: "",
    locacion: "",
    descripcion: "",
    foto: "",
    idUsuario: "",
    visible: false,
    visibleAdmin: true,
  };

  //Funciones para la subida de imagenes
  const handleUpload = () => {
    //Comprobamos si el usuario esta registrado
    if (!$user && !$admin) {
      Toastify({
        text: "Debes iniciar sesión para subir una imagen",
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "#ff0000",
        stopOnFocus: true,
      }).showToast();
      //Luego lo redirigimos a la pagina de inicio de sesion
      navigate("/login");
      return;
    }

    //Si el usuario esta registrado, entonces procedemos a subir la imagen
    //primero cambiamos el valor de la variable availableUpload
    availableUpload = true;
  };

  //Funciones para la subida de datos
  const handleSubmit = () => {
    //Ponemos la fecha actual
    avistamiento.fecha = getActualDate();
    console.log(avistamiento.fecha);
    avistamiento.hora = getActualHour();
    console.log(avistamiento.hora);
    //Ponemos el id del usuario
    //comprobamos si el usuario es un administrador
    if ($admin) {
      avistamiento.idUsuario = $admin.uid;
    } else {
      avistamiento.idUsuario = $user.uid;
    }
    console.log(avistamiento.idUsuario);
    console.log(avistamiento.locacion);
    //Comprobamos si hay una imagen seleccionada
    if (!selectedImage) {
      showMistake("Debes seleccionar una imagen");
      return;
    }

    uploadFile(selectedImage);
  };

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
    }
  }
  //Función para subir la imagen

  let resultImage: string | undefined;

  async function uploadFile(file) {
    const storageRef = ref(
      storage,
      `Avistamientos/${
        avistamiento.nombre
      } ${getActualDate()} ${getActualHour()}`
    );
    await uploadBytes(storageRef, file);
    resultImage = await getDownloadURL(storageRef);
    console.log(resultImage);
    if (resultImage) {
      avistamiento.foto = resultImage;
    }

    //Comprobamos si el usuario lleno correctamente el formulario
    if (!checkForm()) {
      showMistake(
        "Se deben llenar todos los campos antes de subir un avistamiento"
      );
      return;
    }

    //llamamos a la función para subir los datos
    addAvistamiento();
  }

  //funciones para la adición de fecha
  const getActualDate = () => {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let actualDate = `${day}/${month}/${year}`;
    return actualDate;
  };

  //funciones para la obtención de la hora
  const getActualHour = () => {
    let date = new Date();
    let hour = date.getHours();
    let minutes = date.getMinutes();

    let actualHour = `${hour}:${minutes}`;
    return actualHour;
  };

  //Funciones para la subida de datos
  const addAvistamiento = async () => {
    try {
      //Añadimos el menu a la base de datos
      const docRef = await addDoc(
        collection(db, "Avistamientos"),
        avistamiento
      );
      //addDoc es un elemento propio de firebase para añadir documentos a la base de datos tenemos que enviar por parametros el db que lo importamos anteriormente y el nombre de la coleccion en la que queremos guardar el documento adicional a esto le enviamos el objeto que queremos guardar si no hay una colección con el nombre que le enviamos se creara una nueva y si ya existe se añadira el documento a la colección
      console.log("Document written with ID: ", docRef.id);
      //mostramos una notificación de exito
      showSuccess("Avistamiento subido con exito");
      //Se reestablece el formulario
      resetForm();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  //Creamos la función para reestablecer el formulario
  const resetForm = () => {
    avistamiento = {
      nombre: "",
      fecha: "",
      hora: "",
      locacion: "",
      descripcion: "",
      foto: "",
      idUsuario: "",
      visible: false,
      visibleAdmin: true,
    };
    selectedImage = undefined;
    availableUpload = false;
  };

  //Función para compr obar si el usuario lleno correctamente el formulario
  const checkForm = () => {
    if (
      avistamiento.descripcion === "" ||
      avistamiento.locacion === "" ||
      avistamiento.nombre === "" ||
      avistamiento.foto === ""
    ) {
      return false;
    }
    return true;
  };

  //Funciones para mostrar notificaciones con error dado
  const showMistake = (errorMesage: string) => {
    // Utilizando toastify para mostrar notificaciones
    Toastify({
      text: errorMesage,
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff0000",
      stopOnFocus: true,
      close: true,
    }).showToast();
  };

  //Funciones para mostrar imagen de previsualización
  let showimagePreview = false;

  //funciones para el filtrado de avistamientos en base a la locacion
  //variable para guardar la variable de filtrado
  let locacion: string = "Locación 1";
  //funcion diseañada para el cambio de locacion
  const handleChange = (locacionenter: number) => {
    if (locacionenter == 1) {
      locacion = "Locación 1";
    } else if (locacionenter == 2) {
      locacion = "Locación 2";
    } else if (locacionenter == 3) {
      locacion = "Locación 3";
    } else if (locacionenter == 4) {
      locacion = "Locación 4";
    }
    console.log(locacion);
  };

  //Funciones para mostrar las imagenes subidas por el usuario
  //variable para guardar los avistamientos sin filtrar
  let avistamientosSinFiltrar: any = [];
  //variable para guardar los avistamientos
  let avistamientos: any = [];

  //funcion para traer los avistamientos de la base de datos
  const unsub = onSnapshot(
    collection(db, "Avistamientos"),
    (querySnapshot) => {
      avistamientos = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });
      //guardamos los avistamientos sin filtrar
      avistamientosSinFiltrar = avistamientos;

      console.log("Filtrando");
      avistamientos = avistamientosSinFiltrar.filter((avistamiento: any) => {
        return (
          avistamiento.visible == true && avistamiento.locacion == locacion
        );
      });

      //comprobamos que se esten filtrando los avistamientos
      console.log(avistamientos.length);
      console.log(avistamientos);
    },
    (error) => {
      console.log(error);
    }
  );

  //Vamos a dejar de que escuche los cambios
  onDestroy(() => {
    unsub();
  });

  //función reactiva para mostrar los avistamientos cuando cambie la locación
  $: {
    //filtramos primero por los avistamientos visibles
    console.log("Filtrando");
    avistamientos = avistamientosSinFiltrar.filter((avistamiento: any) => {
      return avistamiento.visible == true && avistamiento.locacion == locacion;
    });
  }
  //funciones para la parte de evento mas especifico
  const gotoEvento = () => {
    navigate("/evento");
  };

  //Funciones para mostrar notificaciones de exito
  const showSuccess = (successMessage: string) => {
    // Utilizando toastify para mostrar notificaciones
    Toastify({
      text: successMessage,
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#00ff00",
      stopOnFocus: true,
      close: true,
    }).showToast();
  };
</script>

<body>
  <header class="header">
    <div class="header-content container">
      <div class="header-txt">
        <h1 class="neon text-pop-up-top">AVISTAMIENTOS</h1>
        <p>
          Lugares donde se han avistado signos de vida maritima en distintas
          locaciones del planeta
        </p>
      </div>
    </div>
  </header>

  <!--Creamos las tags necesarias para mostrar las locaciones correspondientes-->

  <div class="containerTags color-change-2x">
    <button on:click|preventDefault={() => handleChange(1)}>Locación 1</button>
    <button on:click|preventDefault={() => handleChange(2)}>Locación 2</button>
    <button on:click|preventDefault={() => handleChange(3)}>Locación 3</button>
    <button on:click|preventDefault={() => handleChange(4)}>Locación 4</button>
  </div>

  <section class="containerEventos">
    {#if avistamientos.length == 0}
      <h1 style="color:#fff; text-transform: uppercase;">
        No hay avistamientos
      </h1>
    {:else}
      <!--Se mostraran los avistamientos de la locacion seleccionada-->
      {#each avistamientos as avistamiento}
        <div class="container">
          <div class="containerEventos-txt">
            <div class="event-details">
              <!--Parte de la carga de las imagenes subidas por el usuario-->
              <!--Comprobamos si el arreglo esta vació-->
              <h1 style="text-transform: uppercase;">{avistamiento.nombre}</h1>
              <p>{avistamiento.fecha}</p>
              <p>{avistamiento.locacion}</p>
              <p>{avistamiento.descripcion}</p>
            </div>
            <div class="event-image">
              <img
                src={avistamiento.foto}
                alt=""
                style="width: 60%; height: 60%;"
              />
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </section>

  <section>
    <!--Parte de la solicitud de subida de imagenes-->

    {#if !availableUpload}
      <div class="container10">
        <button class="neon1" on:click|preventDefault={handleUpload}
          >Sube tu propia imagen</button
        >
      </div>
    {:else}
      <div class="container1">
        <div class="row">
          <!--Creación del formulario para la adición de menus -->
          <div class="col-md-6">
            <div class="container">
              <div class="container-form">
                <form>
                  <label for="nombre">Nombre:</label>
                  <input
                    type="text"
                    id="nombre"
                    bind:value={avistamiento.nombre}
                  />

                  <label for="locacion">Locación:</label>
                  <select id="locacion" bind:value={avistamiento.locacion}>
                    <option value="" disabled selected
                      >Seleccione una opción</option
                    >
                    <option value="Locación 1">Locación 1</option>
                    <option value="Locación 2">Locación 2</option>
                    <option value="Locación 3">Locación 3</option>
                    <option value="Locación 4">Locación 4</option>
                    <!-- Puedes agregar más opciones aquí -->
                  </select>

                  <label for="descripcion">Descripción:</label>
                  <textarea
                    id="descripcion"
                    bind:value={avistamiento.descripcion}
                  />

                  <div class="file-input-container">
                    <label for="imagen">Imagen:</label>
                    <input 
                      type="file"
                      on:change|preventDefault={handleImageSelect}
                      accept="image/*"
                    /> (FILE CHOOSE)
                  </div>

                  <button type="submit" on:click|preventDefault={handleSubmit}
                    >Guardar</button
                  >
                </form>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="container-form-image">
              {#if selectedImage}
                <div style="justify-content: center; align-items: center;">
                  <h3>Previsualización de la imagen</h3>
                  <img
                    class="pulsate-bck"
                    src={URL.createObjectURL(selectedImage)}
                    alt="Imagen seleccionada"
                  />
                </div>
              {:else}
                <p>Selecciona una imagen</p>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </section>
</body>

<style>
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

  .containerTags {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    height: 100px;
    border: 1px solid black;
    border-radius: 10px;
    margin: 10px;
  }

  /* Estilos generales del formulario */
  form {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }

  input,
  textarea {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }

  textarea {
    resize: vertical;
  }

  button {
    color: transparent;
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

  /* Estilos específicos para el campo de foto */
  .file-input-container {
    position: relative;
    overflow: hidden;
  }

  .file-input-container{
    color: #fff;
  }

  .file-input-container input[type="file"] {
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  /* Estilos específicos para el combobox (select) */
  select {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    appearance: none;
    background-color: #fff;
    background-image: linear-gradient(45deg, transparent 50%, #007bff 50%),
      linear-gradient(135deg, #007bff 50%, transparent 50%);
    background-position: calc(100% - 20px) center, calc(100% - 15px) center;
    background-size: 5px 5px, 5px 5px;
    background-repeat: no-repeat;
    color: #333;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Cambiar el estilo del cursor cuando se pasa sobre el combobox */
  select:hover {
    background-color: #f8f8f8;
  }

  /* Cambiar el estilo del combobox cuando está enfocado */
  select:focus {
    outline: none;
    border-color: #007bff;
  }

  /* Estilo de las opciones dentro del combobox */
  select option {
    padding: 10px;
  }

  /* Estilo para la opción seleccionada */
  select option:checked {
    background-color: #007bff;
    color: #fff;
  }

  /* Estilo para las opciones al desplegarse */
  select option:hover {
    background-color: #f8f8f8;
  }

  .color-change-2x {
    -webkit-animation: color-change-3x 4s linear infinite alternate both;
    animation: color-change-3x 4s linear infinite alternate both;
  }
  /*estilos para las locaciones*/
  /* ----------------------------------------------
 * Generated by Animista on 2023-8-28 20:53:9
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

  /**
 * ----------------------------------------
 * animation color-change-2x
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

  .container-form {
    min-width: 500px;
    height: auto;
  }

  .container-form-image{
    display: flex;
    align-items: center;
    align-content: center;
  }

  .container-form-image img{
    width: 400px;
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

  .neon1 {
    font-size: 1em;
    font-weight: 50;
    color: #fff;
    text-shadow: 0 0 5px #03e9f4, 0 0 25px #03e9f4, 0 0 50px #03e9f4,
      0 0 100px #03e9f4;
    letter-spacing: 5px;
    cursor: pointer;
    text-transform: uppercase;
    transition: 1s;
  }

  .neon1:hover {
    color: #fff;
    text-shadow: 0 0 100px #03e9f4, 0 0 25px #03e9f4, 0 0 50px #03e9f4,
      0 0 100px #03e9f4;
  }

  .container10 {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .container10 button {
    margin: 30px;
  }
</style>
