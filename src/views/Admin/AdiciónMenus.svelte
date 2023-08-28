<script lang="ts">
  //Importar onMount y onDestroy
  import { onMount, onDestroy } from "svelte";

  //importamos las stores
  import { user, admin } from "../../stores/User";
  import {
    restauranteStore,
    getRestaurante,
  } from "../../stores/RestaranteStore";

  //Importamos el tipo de restaurante de la carpeta logica
  import type { restaurant } from "../../lib/logic/restaurante";
  import { navigate } from "svelte-routing/src/history";

  //importamos el tipo de dato menu
  import type { Menu } from "../../lib/logic/menu";

  //importamos lo necesario para comunicar con la base de datos
  import { db } from "../../firebase";
  import {
    addDoc,
    collection,
    onSnapshot,
    updateDoc,
    doc,
  } from "firebase/firestore";

  //importamos lo necesario para la subida de imagenes
  import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
  import { storage } from "../../firebase";

  //Importamos los modulos necesarios para mostrar notificaciones
  import Toastify from "toastify-js";

  //Creamos una variable para almacenar los datos del restaurante
  let restaurante: restaurant = {
    idRestaurante: 0,
    img: "https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Restaurantes%2Fnot-found-icon-4.jpg?alt=media&token=5b0a8e01-c4b6-4218-8983-bbc4648cbf67",
    nombre: "ejemplo",
    direccion: "",
    telefono: 0,
    horaApertura: "",
    horaCierre: "",
    descripcion: "",
    puntuacion: 5.0,
    visible: true,
  };

  onMount(() => {
    //Obtenemos el restaurante de la store
    restauranteStore.subscribe((value) => {
      restaurante = value;
      console.log(restaurante);
      if (restaurante == null) {
        console.log("No hay restaurante");
        goAdicionRestaurantes();
      }
    });
  });

  //funcion para navegar a la vista de adición de restaurantes
  const goAdicionRestaurantes = () => {
    console.log("Si");
    navigate("/login", {
      replace: true,
      state: undefined,
    });
  };

  //funcion para prevenir que el usuario refresque la pagina
  window.addEventListener("beforeunload", (event) => {
    // Cancela el evento para mostrar la advertencia personalizada
    event.preventDefault();
    // Chrome requiere que se le asigne un valor al evento.returnValue
    event.returnValue =
      "¿Estás seguro de que quieres salir de esta página? Los cambios no guardados se perderán.";
  });

  //Creamos un objeto de tipo menu
  let menu: Menu = {
    nombre: "",
    precio: 0,
    descripcion: "",
    idRestaurante: 0,
    imagen: "",
    visible: true,
  };

  //Variable para saber cuando se esta editando un menu
  let onEdit = false;

  //funciones para el tratamiento del formulario
  const handleSubmit = () => {
    //Asignamos el id del restaurante al que pertenece el menu
    menu.idRestaurante = restaurante.idRestaurante;
    //Si no se esta editando un restaurante
    if (!onEdit) {
      //Comprobamos si hay una imagen seleccionada
      if (selectedImage) {
        uploadFile(selectedImage);
      } else {
        //Se llama a la función de adición de restaurantes
        addMenu();
      }
    } else {
      //Comprobamos si hay una imagen seleccionada
      if (selectedImage) {
        uploadFile(selectedImage);
      } else {
        //Se llama a la función de edición de restaurantes
        handleEdit();
      }
    }
  };

  //Funciones para la creación de menus
  //Función para añadir un menu
  const addMenu = async () => {
    try {
      //Añadimos el menu a la base de datos
      const docRef = await addDoc(collection(db, "Menus"), menu);
      //addDoc es un elemento propio de firebase para añadir documentos a la base de datos tenemos que enviar por parametros el db que lo importamos anteriormente y el nombre de la coleccion en la que queremos guardar el documento adicional a esto le enviamos el objeto que queremos guardar si no hay una colección con el nombre que le enviamos se creara una nueva y si ya existe se añadira el documento a la colección
      console.log("Document written with ID: ", docRef.id);
      //Se reestablece el formulario
      resetForm();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  //Funciones para la subida de imagenes
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
    const storageRef = ref(storage, `Menus/${menu.nombre}`);
    await uploadBytes(storageRef, file);
    resultImage = await getDownloadURL(storageRef);
    console.log(resultImage);
    if (resultImage) {
      menu.imagen = resultImage;
    }
    if (onEdit) {
      handleEdit();
    } else {
      addMenu();
    }
  }

  //creamos una función para reestablecer el formulario
  const resetForm = () => {
    menu.nombre = "";
    menu.precio = 0;
    menu.descripcion = "";
    menu.imagen = "";
    menu.visible = true;
  };

  //Funciones para traer los menus existentes dentro de la base de datos
  //Creamos un array para almacenar los menus
  let menusSinDepurar: any[] = [];
  let menus: any[] = [];
  //Creamos una función para traer los menus
  //Traer los restaurantes de la base de datos
  const unsub = onSnapshot(
    collection(db, "Menus"),
    (querySnapshot) => {
      menus = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });

      console.log(menus.length);
      console.log(menus);
    },
    (error) => {
      console.log(error);
    }
  );

  //Vamos a dejar de que escuche los cambios
  onDestroy(() => {
    onEdit = false;
    unsub();
  });

  //Funciones para la edición de menus
  //Función para editar un menu
  //creamos una variable para que almacene el id del objeto que se va a editar y asi poder identificarlo
  //Recordar que es el id dado por firebase no el id del restaurante
  let currentid: string = "";

  const editTask = (MenuONEdit) => {
    console.log(MenuONEdit);
    onEdit = true;
    menu = MenuONEdit; //esto es para que el formulario se rellene con los datos del objeto que se va a editar
    currentid = MenuONEdit.id;
  };

  const handleEdit = async () => {
    //creamos la función de editar restaurante
    try {
      if (checkMenu() == false) {
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
      await updateDoc(doc(db, "Menus", currentid), menu);
      onEdit = false;
      resetForm();
    } catch (error) {
      console.log(error);
    }
  };

  //creamos una función para verificar que todos los campos esten llenos
  const checkMenu = () => {
    if (
      restaurante.nombre == "" ||
      restaurante.direccion == "" ||
      restaurante.telefono == 0 ||
      restaurante.horaApertura == "" ||
      restaurante.horaCierre == "" ||
      restaurante.descripcion == ""
    ) {
      return false;
    } else {
      return true;
    }
  };

  //Creación de las funciones para mostrar o dejar de mostrar los menus
  const showOrHide = async (menu) => {
    try {
      await updateDoc(doc(db, "Menus", menu.id), {
        visible: !menu.visible,
      });
    } catch (error) {
      console.log(error);
    }
  };
</script>

<body>
  <h1 class="title">{restaurante.nombre}</h1>
  
  <div class="container">
    <div class="row">
      <div class="col-md-6">
        <div class="form-container">
          <form class="form" on:submit|preventDefault={handleSubmit}>
            <div class="form-group">
              <label for="nombre">Nombre:</label>
              <input type="text" id="nombre" bind:value={menu.nombre} required />
            </div>
            <div class="form-group">
              <label for="precio">Precio:</label>
              <input type="number" id="precio" bind:value={menu.precio} required />
            </div>
            <div class="form-group">
              <label for="descripcion">Descripción:</label>
              <textarea id="descripcion" bind:value={menu.descripcion} required></textarea>
            </div>
            <div class="form-group">
              <label for="imagen">Imagen:</label>
              <input type="file" on:change|preventDefault={handleImageSelect} accept="image/*" />
            </div>
            <div class="form-group">
              <label for="visible">Visible:</label>
              <input type="checkbox" id="visible" bind:checked={menu.visible} />
            </div>
            <div class="form-group">
              <button type="submit">Guardar</button>
            </div>
          </form>
        </div>
      </div>
      <div class="col-md-6">
        <h1 class="title">Menus</h1>
        {#each menus as menu}
          <div class="card">
            <div class="card-content">
              <h2 class="card-title">{menu.nombre}</h2>
              <img src={menu.imagen} alt="Imagen del restaurante" class="card-img">
            </div>
            <div class="card-buttons">
              <button class="btn btn-edit" on:click={() => editTask(menu)}>Editar</button>
              {#if menu.visible}
                <button class="btn btn-toggle" on:click={() => showOrHide(menu)}>Ocultar</button>
              {:else}
                <button class="btn btn-toggle" on:click={() => showOrHide(menu)}>Mostrar</button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</body>

<style>
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
    
    .form-group label, .card-title {
      font-weight: bold;
      margin-bottom: 5px;
      display: block;
      color: #3498db; /* Azul celeste */
    }
    
    .form-group input[type="text"],
    .form-group input[type="number"],
    .form-group textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 16px;
      margin-bottom: 15px;
    }
    
    .form-group textarea {
      resize: vertical;
    }
    
    .form-group button {
      background-color: #007bff;
      color: #fff;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
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
