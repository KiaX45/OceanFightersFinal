<script lang="ts">
  /**
   * @version 1.0.0
   * Este modulo cumplira la función de permitir a los administradores comprobar las imagenes subidas por los usuarios
   * y decidir si son validas o no.
   * Tambien vamos a permitir a los administrasdores controlar la visibilidad de los avistamientos de cada una de las ubicaciones validas
   */

  //Importar onMount y onDestroy
  import { onMount, onDestroy } from "svelte";

  //importamos los modulos para mostrar notificaciones de toastify
  import Toastify from "toastify-js";

  //importamos los modulos necesarios para comunicar con la base de datos
  import { db } from "../../firebase";
  import {
    addDoc,
    collection,
    onSnapshot,
    updateDoc,
    doc,
  } from "firebase/firestore";

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

  //Funciones para traer los avistamientos de la base de datos
  //variable para guardar los avistamientos
  let avistamientos: any = [];
  //variable para guardar los avistamientos sin filtrar
  let avistamientosSinFiltrar: any = [];
  //funcion para traer los avistamientos de la base de datos
  //Traer los restaurantes de la base de datos
  const unsub = onSnapshot(
    collection(db, "Avistamientos"),
    (querySnapshot) => {
      avistamientos = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });
      //guardamos los avistamientos sin filtrar
      avistamientosSinFiltrar = avistamientos;

      //Utilizamos las función filter para filtrar en base a la locacion
      console.log(locacion);
      console.log(avistamientos);

      console.log("Filtrando");
      avistamientos = avistamientosSinFiltrar.filter((avistamiento: any) => {
        return avistamiento.locacion == locacion;
      });

      //solo se deben mostrar los avistamientos cuya visbleAdmin sea verdadero
      avistamientos = avistamientos.filter((avistamiento: any) => {
        return avistamiento.visibleAdmin == true;
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

  //creamoos una función reactiva para el filtrado de avistamientos
  $: {
    avistamientos = avistamientosSinFiltrar.filter((avistamiento: any) => {
      return avistamiento.locacion == locacion;
    });
    //solo se deben mostrar los avistamientos cuya visbleAdmin sea verdadero
    avistamientos = avistamientos.filter((avistamiento: any) => {
      return avistamiento.visibleAdmin == true;
    });

    console.log(avistamientos);
  }

  //Funciones para la edición de propiedades
  const handleEdit = async (Avistamientodit) => {
    //comprobamos si el avistamiento esta visible o no
    Avistamientodit.visible = !Avistamientodit.visible;
    try {
      await updateDoc(
        doc(db, "Avistamientos", Avistamientodit.id),
        Avistamientodit
      );
      //mostramos la notificación de exito
      mostrarNotificacionExito();
      console.log("Avistamiento editado");
    } catch (error) {
      console.log(error);
    }
  };

  //Funciones para la eliminación de avistamientos
  const handleDelete = async (avistamientoonDelete) => {
    try {
      //Pedimos una confirmación en forma de alerta
      const confirmacion = confirm(
        "¿Estas seguro de eliminar el avistamiento?"
      );
      if (!confirmacion) {
        return;
      }
      //eliminamos el avistamiento
      avistamientoonDelete.visibleAdmin = false;
      //oculatamos el avistamiento para los usuarios
      avistamientoonDelete.visible = false;
      updateDoc(
        doc(db, "Avistamientos", avistamientoonDelete.id),
        avistamientoonDelete
      );
      //mostramos la notificación de exito
      mostrarNotificacionExito();
      console.log("Avistamiento eliminado");
    } catch (error) {
      console.log(error);
    }
  };

  //Funciones para la muestra de notificaciones de exito
  const mostrarNotificacionExito = () => {
    Toastify({
      text: "Avistamiento editado con exito",
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "#4caf50",
      stopOnFocus: true,
    }).showToast();
  };
</script>

<body>
  <header class="header">
    <div class="header-content container">
      <div class="header-txt">
        <h1 class="neon text-pop-up-top">COMPROBACIÓN DE AVISTAMIENTOS</h1>
        <p>
          Selecciona un avistamiento de interes para mostrar o no al público
        </p>
      </div>
    </div>
  </header>
  <div class="containerTags color-change-2x">
    <button on:click|preventDefault={() => handleChange(1)}>Locación 1</button>
    <button on:click|preventDefault={() => handleChange(2)}>Locación 2</button>
    <button on:click|preventDefault={() => handleChange(3)}>Locación 3</button>
    <button on:click|preventDefault={() => handleChange(4)}>Locación 4</button>
  </div>

  <section class="containerEventos">
    {#if avistamientos.length == 0}
      <h1>No hay avistamientos</h1>
    {:else}
      <!--Se mostraran los avistamientos de la locacion seleccionada-->
      {#each avistamientos as avistamiento}
        <div class="container">
          <div class="containerEventos-txt">
            <div class="event-details">
              <!--Parte de la carga de las imagenes subidas por el usuario-->
              <!--Comprobamos si el arreglo esta vació-->

              <p>{avistamiento.nombre}</p>
              <p>{avistamiento.fecha}</p>
              <p>{avistamiento.locacion}</p>
              <p>{avistamiento.descripcion}</p>
              {#if avistamiento.visible == false}
                <button on:click={() => handleEdit(avistamiento)}
                  >Mostrar</button
                >
              {:else}
                <button on:click={() => handleEdit(avistamiento)}
                  >Ocultar</button
                >
              {/if}
              <button on:click={() => handleDelete(avistamiento)}
                >Eliminar</button
              >
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
</body>

<!--Se mostraran las locaciones pertinentes para la filtraci'on de locaciones-->

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
    font-size: 45px;
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

  /*estilos para las locaciones*/
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

  /*estilos para las locaciones*/
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
</style>
