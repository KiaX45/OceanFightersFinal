<script lang="ts">
  //Importar onMount y onDestroy
  import { onMount, onDestroy } from "svelte";

  //Importamos el tipo de restaurante de la carpeta logica
  import type { restaurant } from "../../lib/logic/restaurante";

  //importamos lo necesario para comunicar con la base de datos
  import { db } from "../../firebase";
  import { addDoc, collection, onSnapshot, updateDoc, doc } from "firebase/firestore";

  //importamos lo necesario para la subida de imagenes
  import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
  import { storage } from "../../firebase";

  //iportamos la store restauranteStore.ts
    import { restauranteStore } from "../../stores/RestaranteStore";

  //Importamos los modulos de svelte routing
    import { navigate } from "svelte-routing";

  //Importamos los modulos de notificaciones
    import Toastify from "toastify-js";

  //Creamos un tipo de dato para el restaurante
  let restaurante: restaurant = {
    idRestaurante: 0,
    img: "https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Restaurantes%2Fnot-found-icon-4.jpg?alt=media&token=5b0a8e01-c4b6-4218-8983-bbc4648cbf67",
    nombre: "",
    direccion: "",
    telefono: 0,
    horaApertura: "",
    horaCierre: "",
    descripcion: "",
    puntuacion: 5.0,
    visible: true,
  };

  

  let currentid:string = "";

  //Creamos una función para gestionar el envio del formulario
  const handleSubmit = () => {
     //Asignamos el id del restaurante
      asignarId(restaurantes);
    //Si no se esta editando un restaurante
    if (!onEdit) {
      //Comprobamos si hay una imagen seleccionada
      if (selectedImage) {
        uploadFile(selectedImage);
      } else {
        //Se llama a la función de adición de restaurantes
        addRestaurante();
      }
    } else {
      //Comprobamos si hay una imagen seleccionada
      if (selectedImage) {
        uploadFile(selectedImage);
      } else {
        //Se llama a la función de edición de restaurantes
        handleEdit();
      }
      
      //console.log("Editando");
    }
  };

  //Función para adicionar un restaurante
  const addRestaurante = async () => {
    try {
      //comprobamos si el restaurante tiene todos los parametros llenos
      if(checkRestaurante() == false){
        Toastify({
          text: "No se puede añadir un restaurante sin haber llenado todos los campos",
          duration: 3000,
          gravity: "top",
          position: "center",
          backgroundColor: "#FF0000",
          stopOnFocus: true,
        }).showToast();
        return;
      }
      console.log(restaurante);
      const docRef = await addDoc(collection(db, "Restaurantes"), restaurante);
      //addDoc es un elemento propio de firebase para añadir documentos a la base de datos tenemos que enviar por parametros el db que lo importamos anteriormente y el nombre de la coleccion en la que queremos guardar el documento adicional a esto le enviamos el objeto que queremos guardar si no hay una colección con el nombre que le enviamos se creara una nueva y si ya existe se añadira el documento a la colección
      console.log("Document written with ID: ", docRef.id);
      //Se reestablece el formulario
      resetForm();
    } catch (e) {
      console.error("Error adding document: ", e);
    }

  };

  let restaurantes = [];

  //Traer los restaurantes de la base de datos
  const unsub = onSnapshot(
    collection(db, "Restaurantes"),
    (querySnapshot) => {
      restaurantes = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });
     

      console.log(restaurantes);
    },
    (error) => {
      console.log(error);
    }
  );
  //Vamos a dejar de que escuche los cambios
  onDestroy(() => {
    unsub();
  });

  //Crearemos una función para asignar el id del restaurante
  const asignarId = (restaurantes) => {
    //Si el arreglo de restaurantes esta vacio
    if (restaurantes.length == 0) {
      //Se le asigna el id 1
      restaurante.idRestaurante = 0;
    } else {
      //Si no se le asigna el id del ultimo restaurante + 1
      //primero ordenamos el arreglo en base al id
      restaurantes.sort((a, b) => {
        return b.idRestaurante - a.idRestaurante;
      });
      console.log(restaurantes);
      restaurante.idRestaurante =
        restaurantes[0].idRestaurante + 1;
    }
  };

  //Variable para saber cuando se esta editando un restaurante
  let onEdit = false;

  //Creamos funciones para el procesamiento de imagenes
  //Variable que almacenara la imagen seleccionada
  let selectedImage: File | undefined;
  //Función para seleccionar la imagen
  function handleImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      selectedImage = input.files[0];
      console.log(selectedImage);
    }
  }
  //Función para subir la imagen

  let resultImage: string | undefined;

  async function uploadFile(file) {
    console.log(file);
    const storageRef = ref(storage, `Restaurantes/${restaurante.nombre}`);
    await uploadBytes(storageRef, file);
    resultImage = await getDownloadURL(storageRef);
    console.log(resultImage);
    if(resultImage){
      restaurante.img = resultImage;
    }
    if(onEdit){
      console.log("Editando");
      handleEdit();
    }else{
      console.log("Añadiendo");
      addRestaurante();
    }
  }


  //Funciones para reestablecer el formulario
    const resetForm = () => {
        restaurante = {
        idRestaurante: 0,
        img: "",
        nombre: "",
        direccion: "",
        telefono: 0,
        horaApertura: "",
        horaCierre: "",
        descripcion: "",
        puntuacion: 5.0,
        visible: true,
        };
        resetImage();
    };

   //Funciones para reesetear la selección de imagenes
    const resetImage = () => {
        selectedImage = undefined;
    }; 

    //creamos la función de editar restaurante
    const editTask = (restauranteONEdit) => {
        onEdit = true;
        //restauranteStore.set(restaurante);
        restaurante = restauranteONEdit;
        currentid = restauranteONEdit.id;

    };

    //creamos la función de editar restaurante
    const handleEdit = async () => {
      try {
        if(checkRestaurante() == false){
          Toastify({
            text: "No se puede editar un restaurante sin haber llenado todos los campos",
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "#FF0000",
            stopOnFocus: true,
          }).showToast();
          return;
        }
        await updateDoc(doc(db, "Restaurantes", currentid), restaurante); 
        onEdit = false;
        resetForm();
      } catch (error) {
        console.log(error);
      }
       

    };

    //Función para cambiar la visibilidad de un restaurante
    const ShoworHideRestaurant = async (restauranteONDelete) => {
      try {
        //editamos la tarea para que su estado de visible sea false
        restauranteONDelete.visible = !restauranteONDelete.visible;
        //actualizamos la tarea
        await updateDoc(doc(db, "Restaurantes", restauranteONDelete.id), restauranteONDelete);
      } catch (error) {
        console.log(error);
      }
    };

    //Función para ir a la pagina de adición de menus
    const goToAddMenu = () => {
      //En caso de que el restautrante no tenga datos no se podra ir a la pagina de adición de menus
      if(restaurante.nombre == "" || restaurante.direccion == "" || restaurante.telefono == 0 || restaurante.horaApertura == "" || restaurante.horaCierre == "" || restaurante.descripcion == "" || restaurante.img == ""){
        Toastify({
          text: "No se puede ir a la pagina de adición de menus sin haber añadido un restaurante",
          duration: 3000,
          gravity: "top",
          position: "center",
          backgroundColor: "#FF0000",
          stopOnFocus: true,
        }).showToast();
        return;
      }
      
      //primero guardamos el restaurante en la store
      restauranteStore.set(restaurante);
      //navegamos a la pagina de adición de menus
      navigate("/adicionmenus");
    };

    //comprobar si el documento tiene todos los parametros llenos
    const checkRestaurante = () => {
      if(restaurante.nombre == "" || restaurante.direccion == "" || restaurante.telefono == 0 || restaurante.horaApertura == "" || restaurante.horaCierre == "" || restaurante.descripcion == "" || restaurante.img == ""){
        return false;
      }else{
        return true;
      }
    };
</script>

<body>
  <header class="header">
    <div class="header-content container">
      <div class="header-txt">
        <h1 class="neon text-pop-up-top">ADICIÓN DE RESTAURANTES</h1>
        <p>
          Lugar par ala adición de nuevos restaurante o editar los antiguos para
          ser presentados al público en general
        </p>
      </div>
    </div>
  </header>
  <main>
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <form class="form" on:submit|preventDefault={handleSubmit}>
            <label for="img">URL de la imagen:</label>
            <input
              type="file"
              class="input"
              on:change|preventDefault={handleImageSelect}
              accept="image/*"
            />

            <label for="nombre">Nombre:</label>
            <input
              type="text"
              class="input"
              id="nombre"
              bind:value={restaurante.nombre}
            />

            <label for="direccion">Dirección:</label>
            <input
              type="text"
              class="input"
              id="direccion"
              bind:value={restaurante.direccion}
            />

            <label for="telefono">Teléfono:</label>
            <input
              type="number"
              class="input"
              id="telefono"
              bind:value={restaurante.telefono}
            />

            <label for="horario">Hora Apertura:</label>
            <input
              type="time"
              class="input"
              id="horario"
              bind:value={restaurante.horaApertura}
            />

            <label for="horario">Hora Cierre:</label>
            <input
              type="time"
              class="input"
              id="horario"
              bind:value={restaurante.horaCierre}
            />

            <label for="descripcion">Descripción:</label>
            <textarea
              class="textarea"
              id="descripcion"
              bind:value={restaurante.descripcion}
            />

            <button class="btn" type="submit">Guardar</button>
            <button class="btn" on:click={goToAddMenu}>Adicionar Menú</button>
          </form>
        </div>
        <div class="col-md-6">
          {#each restaurantes as restaurante}
            <div class="card">
              <div class="card-content">
                <h2 class="card-title">{restaurante.nombre}</h2>

                <img
                  src={restaurante.img}
                  alt="Imagen del restaurante"
                  class="card-img"
                />
              </div>
              <div class="card-buttons">
                <button
                  class="btn btn-edit"
                  on:click={() => editTask(restaurante)}>Editar</button
                >
                {#if restaurante.visible}
                  <button
                    class="btn btn-toggle"
                    on:click={() => ShoworHideRestaurant(restaurante)}
                    >Dejar de Mostrar</button
                  >
                {:else}
                  <button
                    class="btn btn-toggle"
                    on:click={() => ShoworHideRestaurant(restaurante)}
                    >Mostrar</button
                  >
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </main>
</body>

<style>
  
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

  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
  }

  .title {
    text-align: center;
    margin-top: 20px;
    color: #3498db; /* Azul celeste */
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .col-md-6 {
    flex: 0 0 calc(50% - 10px);
    background-color: #ecf0f1; /* Gris claro */
    border-radius: 5px;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .form label,
  .card-title {
    font-weight: bold;
    margin-bottom: 5px;
    display: block;
    color: #3498db; /* Azul celeste */
  }

  .input,
  .textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 15px;
  }

  .textarea {
    resize: vertical;
  }

  .btn {
    padding: 10px 20px;
    background-color: #3498db; /* Azul celeste */
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .btn:hover {
    background-color: #2980b9; /* Azul más oscuro */
  }

  .card {
    border: 2px solid #ccc;
    border-radius: 5px;
    margin-bottom: 20px;
    padding: 10px;
    background-color: #ecf0f1; /* Gris claro */
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center; /* Centra los elementos horizontalmente */
  }

  .card-content {
    flex: 1;
    padding: 10px;
    text-align: center; /* Centra el texto en el centro */
  }

  .card-title {
    margin: 0;
    color: #3498db; /* Azul celeste */
  }

  .card-id {
    color: #888;
    margin-bottom: 5px;
  }

  .card-img {
    width: 100%;
    max-width: 300px;
    height: auto;
    display: block; /* Para centrar la imagen */
    margin: 10px auto; /* Centra la imagen verticalmente */
  }

  .card-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10px;
  }

  .btn-edit {
    background-color: #f39c12; /* Naranja claro */
    margin-bottom: 5px;
  }

  .btn-toggle {
    background-color: #27ae60; /* Verde oscuro */
    margin-bottom: 5px;
  }
</style>