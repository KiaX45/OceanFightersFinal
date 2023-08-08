<script>
//importamos lo necesario para conectarnos la base de datos
import { db } from "../../firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

//importamos onDestroy para que se ejecute cuando se destruya el componente
import { onDestroy } from "svelte";

//Importamos user de las stores
import { user } from "../../stores/User";

console.log($user);

//Creamos un objeto usuario
let userNow = {
    uid: "",
    username: "",
    email: "",
    imagen:
      "https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Users%2Fuserfoto.jpg?alt=media&token=1bb0cebc-14a5-4e20-94ed-aaa191ddf958",
}

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
      if(usuarios.lenght > 1){
        console.log("Hay mas de un usuario con el mismo correo");
      }
        userNow.uid = usuarios[0].uid;
        userNow.username = usuarios[0].username;
        userNow.email = usuarios[0].email;
        if(usuarios[0].imagen != null){
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
    const unsub2 = onSnapshot(
    collection(db, "participantes"),
    (querySnapshot) => {
      participantes = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });

      participantes = participantes.filter((evento) => {
        return evento.uidParticipante == $user.uid;
      });

      console.log(participantes);
     
    },
    (error) => {
      console.log(error);
    }
  );

  //vamos a traer los eventos de este usuario
    let eventos = [];
    let eventosSinFiltrar = [];
    const unsub3 = onSnapshot(
    collection(db, "Eventos"),
    (querySnapshot) => {
      eventos = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id }; //con esto decimos que por cada recorrido trasformamos los datos en un objeto
      });
      eventosSinFiltrar = eventos;
      for (let index = 0; index < participantes.length; index++) {
        eventos = eventosSinFiltrar.filter((evento) => {
        return evento.id == participantes[index].uidEvento;
      });
      }
      console.log(eventos);
    }
    );

  //Vamos a dejar de que escuche los cambios
  onDestroy(() => {
    unsub3();
    unsub2();
    unsub();
  });

</script>

<!--Información del usuario-->
<h1>{userNow.username}</h1>
<img src="{userNow.imagen}" alt="Imagen de perfil" width="200px" height="200px">
<h1>{userNow.email}</h1>
<!--Información de los -->
{#each eventos as evento}
     <h1>{evento.nombre}</h1>
     <h1>{evento.dia}</h1>
{/each}

<style>


</style>