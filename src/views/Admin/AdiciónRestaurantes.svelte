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
    const storageRef = ref(storage, `Restaurantes/${restaurante.nombre}`);
    await uploadBytes(storageRef, file);
    resultImage = await getDownloadURL(storageRef);
    console.log(resultImage);
    if(resultImage){
      restaurante.img = resultImage;
    }
    if(editTask){
      handleEdit();
    }else{
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

<h1>Adición restaurantes</h1>

<!--Creación de un formulario de adición de restaurantes-->
<main>
  <div class="container">
    <div class="row">
      <div class="col-md-6">
        <form on:submit|preventDefault={handleSubmit}>
          <label for="img">URL de la imagen:</label>
          <input
            type="file"
            on:change|preventDefault={handleImageSelect}
            accept="image/*"
          />

          <label for="nombre">Nombre:</label>
          <input type="text" id="nombre" bind:value={restaurante.nombre} />

          <label for="direccion">Dirección:</label>
          <input
            type="text"
            id="direccion"
            bind:value={restaurante.direccion}
          />

          <label for="telefono">Teléfono:</label>
          <input
            type="number"
            id="telefono"
            bind:value={restaurante.telefono}
          />

          <label for="horario">Hora Apertura:</label>
          <input
            type="time"
            id="horario"
            bind:value={restaurante.horaApertura}
          />

          <label for="horario">Hora Cierre:</label>
          <input type="time" id="horario" bind:value={restaurante.horaCierre} />

          <label for="descripcion">Descripción:</label>
          <textarea id="descripcion" bind:value={restaurante.descripcion} />

          <button type="submit">Guardar</button>
          <button on:click={goToAddMenu}>Adicionar Menu</button>
        </form>
      </div>
      <!--En esta columna se mostraran los restaurantes ya añadidos-->
      <div class="col-md-6">
        {#each restaurantes as restaurante}
          <div style="border: 2px solid;">
            <div class="form-control w-100">
              {restaurante.nombre}
              {restaurante.idRestaurante}
              <img src={restaurante.img} alt="Imagen del restaurante" style="width: 300px; height: 200px;">
            </div>

            <button on:click={() => editTask(restaurante)}>Editar</button>
            {#if restaurante.visible}
              <button on:click={() => ShoworHideRestaurant(restaurante)}>Dejar De mostrar</button>
            {:else}
              <button on:click={() => ShoworHideRestaurant(restaurante)}> Mostrar</button>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</main>
