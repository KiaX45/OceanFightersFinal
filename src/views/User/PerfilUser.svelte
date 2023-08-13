<script>
  //importamos lo necesario para conectarnos la base de datos
  import { db } from "../../firebase";
  import {
    addDoc,
    collection,
    onSnapshot,
    updateDoc,
    doc,
    deleteDoc
  } from "firebase/firestore";

  //importamos onDestroy para que se ejecute cuando se destruya el componente
  import { onDestroy } from "svelte";

  //Importamos user de las stores
  import { user } from "../../stores/User";

  //Importamos navigate de svelte Routing
  import { navigate } from "svelte-routing";

  //Importamos los modulos para mostrar notificaciones de toastify
  import Toastify from "toastify-js";

  console.log($user);

  //Creamos un objeto usuario
  let userNow = {
    uid: "",
    username: "",
    email: "",
    imagen:
      "https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Users%2Fuserfoto.jpg?alt=media&token=1bb0cebc-14a5-4e20-94ed-aaa191ddf958",
  };

  //Nos conectamos a la base de datos usuarios
  let usuarios = [];
  const unsub = onSnapshot(
    collection(db, "Usuarios"),
    (querySnapshot) => {
      usuarios = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });

      usuarios = usuarios.filter((usuario) => {
        return usuario.uid == $user.uid;
      });
      if (usuarios.lenght > 1) {
        console.log("Hay mas de un usuario con el mismo correo");
      }
      userNow.uid = usuarios[0].uid;
      userNow.username = usuarios[0].username;
      userNow.email = usuarios[0].email;
      if (usuarios[0].imagen != null) {
        userNow.imagen = usuarios[0].imagen;
      }
      console.log(userNow);
    },
    (error) => {
      console.log(error);
    }
  );

  //Array de los eventos de este usuario
  let participantes = [];
  let participantesSinFiltrar = [];
  const unsub2 = onSnapshot(
    collection(db, "participantes"),
    (querySnapshot) => {
      participantes = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });

      console.log(participantes);
      participantesSinFiltrar = participantes;
      participantes = participantesSinFiltrar.filter((evento) => {
        return evento.uidParticipante == $user.uid;
      });

      console.log($user.uid);
      console.log(participantes);
    },
    (error) => {
      console.log(error);
    }
  );

  //Variable para saber cuando hay eventos
  let hayEventosDeParticipacion = true;

  //vamos a traer los eventos de este usuario
  let eventos = [];
  let eventosSinFiltrar = [];
  const unsub3 = onSnapshot(collection(db, "Eventos"), (querySnapshot) => {
    eventos = querySnapshot.docs.map((doc) => {
      return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
    });
    //Comprobamos si este usuario ha participado en algun evento
    if (participantes.length !== 0) {
      //variable para guardar el array de codigo de eventos
      let codigosEventos = [];
      //de todos los eventos que traemos solo mostramos en los que este usuario esta participando
      eventosSinFiltrar = eventos;
      for (let index = 0; index < participantes.length; index++) {
        codigosEventos.push(participantes[index].uidEvento);
      }
      eventos = eventosSinFiltrar.filter((evento) => {
        return codigosEventos.includes(evento.id);
      });
    } else {
      hayEventosDeParticipacion = false;
    }

    console.log(eventos);
  });

  //Vamos a dejar de que escuche los cambios
  onDestroy(() => {
    unsub3();
    unsub2();
    unsub();
  });

  //funciones para navegar al apartado de eventos
  const goToEventos = () => {
    console.log("Si");
    navigate("/eventos");
  };


  //Funciones para corroborar si un evento sigue estando vigente 
  const isAvailable = (eventoOnSelect) => {
    console.log(eventoOnSelect.dia);
    let fechaEvento = new Date(eventoOnSelect.dia);
    let fechaActual = new Date();
    if(fechaEvento > fechaActual){
      return true;
    }else{
      return false;
    }
  };

  let confirmation;
  //Funciones para dejar de participar
  const cancelarParticipacion = (eventoOnSelect) => {
    if(confirmation = window.confirm("¿Estás seguro de que quieres continuar? ")){
      //actualizamos el evento
      let currentid = eventoOnSelect.id;
      eventoOnSelect.participantes = eventoOnSelect.participantes - 1;

      try {
       // updateDoc(doc(db, "Eventos", currentid), eventoOnSelect);
        //borramos de la base de datos de participantes
        let idParticipante = participantes.filter((participante) => {
          return participante.uidEvento == currentid && participante.uidParticipante == $user.uid;
        });
        console.log(idParticipante);
        deleteDoc(doc(db, "participantes", idParticipante[0].id));
        showSucces("Has cancelado tu participación en el evento");

      } catch (error) {
        console.log(error);
      }
    }
  };

  //Funciones para mostrar notificaciones
  const showSucces = (mesage) =>{
    Toastify({
      text: mesage,
      duration: 3000,
      newWindow: true,
      close: true,
      gravity: "top",
      position: "center",
      backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
      stopOnFocus: true,
    }).showToast();
  }

  const showError = (mesage) =>{
    Toastify({
      text: mesage,
      duration: 3000,
      newWindow: true,
      close: true,
      gravity: "top",
      position: "center",
      backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      stopOnFocus: true,
    }).showToast();
  }

</script>

<!--Información del usuario-->
<h1>{userNow.username}</h1>
<img src={userNow.imagen} alt="Imagen de perfil" width="200px" height="200px" />
<h1>{userNow.email}</h1>

<!--Comprobamos si hay eventos para mostrar-->
{#if hayEventosDeParticipacion}
  <!--Información de los eventos-->
  {#each eventos as evento}
    <h1>{evento.nombre}</h1>
    <h1>{evento.dia}</h1>
    {#if isAvailable(evento)}
      <button on:click={() => cancelarParticipacion(evento)}>Cancelar Participación</button>
    {:else}
      <h1>Este evento ya no esta disponible</h1>
    {/if}
  {/each}
{:else}
  <h1>No has participado en ningun evento intentalo ahora</h1>
    <button on:click={goToEventos}>¿Quieres intentarlo?</button>
{/if}

<style>
</style>
