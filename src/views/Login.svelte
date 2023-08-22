<script>
  //Configuración del Registro de Usuario

  import { user, isLoggedIn, admin } from "../stores/User";
  import { navigate, Link } from "svelte-routing";
  import { onMount, onDestroy } from "svelte";
  //importamos lo que necesitamos de firebase
  import { auth } from "../firebase";
  import {
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
  } from "firebase/auth";
  //Imports de las bases de datos
  import { addDoc, collection, onSnapshot } from "firebase/firestore";
  import { db } from "../firebase";
  //importamos las notificaciones de firestore
  import Toastify from "toastify-js";
  import "toastify-js/src/toastify.css";

  //Arreglo con las UID de los administradores
  const adminUid = [
    "rrXXm7j0UNbo5qdb10SFgp84Co82",
    "UgTZ9HuP1Og66qii9of6WbCKuzD2",
    "7x3tWOQWjFckGTBWNC8srj1ddat1",
  ];

  let email = "";
  let password = "";
  let username = "";
  let nombreUsuarioyaRegistrado = false;

  //Función para registrar un usuario

  function handleSubmit() {}
  //creemos un usuario objeto con nombre correo y uid del usuario
  let usuario = {
    nombre: "",
    correo: "",
    uid: "",
  };

  const accederConGoogle = async () => {
    console.log("SI");
    try {
      const provider = new GoogleAuthProvider();
      const resp = await signInWithPopup(auth, provider);
      console.log(resp.user);
      usuario.nombre = resp.user.displayName;
      usuario.correo = resp.user.email;
      usuario.uid = resp.user.uid;
      //console.log(usuario);
      if (adminUid.includes(resp.user.uid)) {
        console.log("admin");
        admin.setAdmin(resp.user);
        console.log($admin);
      } else {
        user.setUser(resp.user);
        // console.log($user);
      }

      //Comprobamos que el usuario no este ya registrado en la base de datos
      verificarNombreDeUsuario();
      if (!nombreUsuarioyaRegistrado) {
        //llamamos a la función para guardar el usuario en la base de datos
        console.log("guardar usuario sOY gENIO")
        userSave.username = resp.user.displayName;
        userSave.email = resp.user.email;
        userSave.image = resp.user.photoURL;
        userSave.uid = resp.user.uid;
        saveUser();
      }

      navigate("/", { replace: true });
    } catch (error) {
      console.log(error.message);
    }
  };

  //Logica de la parte de creación de cuenta con correo y contraseña
  let emailAndpassword = true;

  const changeEmailAndPassword = () => {
    emailAndpassword = !emailAndpassword;
  };

  const registrarseConEmailPassword = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        showMistake("Campos vacios");
        return;
      }

      verificarNombreDeUsuario();
      if (nombreUsuarioyaRegistrado) {
        showMistake("El nombre de usuario ya esta registrado");
        return;
      }


      auth.username = username;
      const resp2 = await createUserWithEmailAndPassword(auth, email, password);
      user.setUser(resp2.user);
      console.log($user);
      console.log($user.uid);
      llenarDatos();
      saveUser();
      //llamamos a la función para guardar el usuario en la base de datos
      guardarUsuario();
      showSuccess("Se ha creado la cuenta con exito");
      navigate("/", { replace: true });
    } catch (error) {
      showMistake(error.message);
    }
  };

  //crear una función para saver si el nombre de usuario ya ha sido agragado
  const verificarNombreDeUsuario = () => {
    if (usuarios.includes(username)) {
      nombreUsuarioyaRegistrado = true;
      console.log("El nombre de usuario ya esta registrado");
    } else {
      nombreUsuarioyaRegistrado = false;
      console.log("El nombre de usuario esta disponible");
    }
  };

  //Logica de la parte de ingreso a una cuenta ya existente con correo y contraseña (login)
  import { signInWithEmailAndPassword } from "firebase/auth";

  const login = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        showMistake("Campos vacios");
        return;
      }
      const resp = await signInWithEmailAndPassword(auth, email, password);
      if (adminUid.includes(resp.user.uid)) {
        admin.setAdmin(true);
        console.log($admin);
      } else {
        user.setUser(resp.user);
        console.log($user);
      }
      showSuccess("Se ha iniciado sesión con exito");
      navigate("/", { replace: true });
    } catch (error) {
      showMistake("El usuario o contraseña no son correctos");
      console.log(error.message);
    }
  };

  //Logica de la base de datos

  //Creamos un objeto que proximamente sera guardado en la base de datos
  let userSave = {
    username: "",
    email: "",
    image: "",
    uid: "",
    admin: false,
  };

  //creamos una funcion para llenar los datos dentro del objeto
  const llenarDatos = () => {
    userSave.username = username;
    userSave.email = email;
    userSave.image = "";
    userSave.uid = $user.uid;
    userSave.admin = false;
  };

  //creamos la función para guardar el usuario en la base de datos
  const saveUser = async () => {
    try {
      console.log(userSave);
      const docRef = await addDoc(collection(db, "Usuarios"), userSave);
      //addDoc es un elemento propio de firebase para añadir documentos a la base de datos tenemos que enviar por parametros el db que lo importamos anteriormente y el nombre de la coleccion en la que queremos guardar el documento adicional a esto le enviamos el objeto que queremos guardar si no hay una colección con el nombre que le enviamos se creara una nueva y si ya existe se añadira el documento a la colección
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  //Crearemos una función que nos retorne si ese nombre de usuario esta disponible o no

  //Primero lo que haremos sera traer la base de datos de usuarios esto es posible incluso si no estamos logeados por las reglas puestas anteriormente en la base de datos de firestore pero solo esta disponible para esta colección

  let usuarios = [];

  //creamos una función pera limpiar el arreglo de usuarios
  const limpiarArregloUsuarios = () => {
    usuarios = [];
  };

  onSnapshot(
    collection(db, "Usuarios"),
    (querySnapshot) => {
      limpiarArregloUsuarios();
      querySnapshot.docs.forEach((doc) => {
        usuarios.push(doc.data().username);
      });
      console.log(usuarios);
    },
    (err) => {
      console.log(err);
    }
  );

  onMount(() => {
    if (!$user) {
      navigate("/login", { replace: true });
    }
  });

  //funciones para mopstrar notificaciones de errores
  let notificationShown = false;

  const styleElement = document.createElement("style");
  styleElement.innerHTML = `
  @keyframes vibrate {
    0% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }
`;
  document.head.appendChild(styleElement);

  const showMistake = (mensaje) => {
    if (!notificationShown) {
      notificationShown = true;

      const toast = Toastify({
        text: mensaje,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
          animation: "fadeIn 0.5s ease-in-out, vibrate 0.2s infinite",
          background: "linear-gradient(to right, #ff0000, #FF8F00)",
          boxShadow: "0px 10px 60px rgba(256, 0, 0, 10)",
        },
      });

      toast.showToast();

      setTimeout(() => {
        notificationShown = false;
      }, 3000);
    }
  };

  //funciones para mopstrar notificaciones de exito
  let successNotificationShown = false;

  const showSuccess = (mensaje) => {
    if (!successNotificationShown) {
      successNotificationShown = true;

      const toast = Toastify({
        text: mensaje,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
          animation: "fadeIn 0.5s ease-in-out, vibrate 0.2s infinite",
          background: "linear-gradient(to right, #1BF81F, #05DE6E)",
          boxShadow: "0px 10px 60px rgba(0, 0, 256, 10)",
        },
      });

      toast.showToast();

      setTimeout(() => {
        successNotificationShown = false;
      }, 3000); // Reset the flag after the notification duration
    }
  };

  //Vamos a crear un objeto apto para subir a la base de datos
  let userdb = {
    username: "",
    email: "",
    imagen: "",
    contraseña: "",
    esAdministrador: false,
  };

  //Creamos la función para hacer el envio de los datos del usuario
  const guardarUsuario = async () =>{
    //llenamos los datos del objeto que debemos enviar
    userdb.username = username;
    userdb.email = email;
    userdb.imagen = "https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Users%2Fuserfoto.jpg?alt=media&token=1bb0cebc-14a5-4e20-94ed-aaa191ddf958";
    userdb.esAdministrador = false;
    userdb.contraseña = password;
    console.log(userdb);
    //enviamos el objeto a la base de datos
    try {
        const response = await fetch("https://oceanfightersserver.onrender.com/AnadirUsuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userdb)
        });

        const data = await response.json();
        showSuccess("Usuario guardado con éxito");
        console.log("Usuario guardado con éxito:", data);
    } catch (error) {
        showMistake("Error al guardar el usuario");
        console.error("Error al guardar el usuario:", error);
    }
  }

</script>

<body>
  <div class="container">
    <form class="form" on:submit|preventDefault={handleSubmit}>
      {#if !emailAndpassword}
        <h1 class="heading">Registrarse</h1>

        <input
          class="input"
          placeholder="Nombre de Usuario"
          bind:value={username}
        />
      {:else}
        <h1 class="heading">Inicio de Sesion</h1>
      {/if}

      <input
        class="input"
        type="email"
        placeholder="Email"
        bind:value={email}
      />

      <input
        class="input"
        type="password"
        placeholder="Contraseña"
        bind:value={password}
      />

      {#if !emailAndpassword}
        <button
          class="button primary"
          type="submit"
          on:click={registrarseConEmailPassword}>Crear Cuenta</button
        >
        <div class="google-login">
          <a href="URL_DE_INICIO_DE_SESION_DE_GOOGLE">
            <button class="button secondary" on:click={accederConGoogle}
              >Ingresar con Google</button
            >
          </a>
        </div>
        <a
          class="link"
          href="#"
          on:click|preventDefault={changeEmailAndPassword}
          >Ingrese con una cuenta ya existente</a
        >
      {:else}
        <button class="button primary" type="submit" on:click={login}
          >Iniciar sesión</button
        >
        <div class="google-login">
          <a href="URL_DE_INICIO_DE_SESION_DE_GOOGLE">
            <button class="button secondary" on:click={accederConGoogle}
              >Ingresar con Google</button
            >
          </a>
        </div>
        <a
          class="link"
          href="#"
          on:click|preventDefault={changeEmailAndPassword}>Cree una cuenta</a
        >
      {/if}
    </form>
  </div>
</body>

<style>
  body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background-color: #092038;
  }

  .container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: url(https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Home%2Fr2.png?alt=media&token=ed78e807-7471-422e-b35c-6039f41ba1e7)
      no-repeat center center;
    background-size: cover;
    overflow: hidden;
  }

  .container::before,
  .container::after {
    content: "";
    position: absolute;
    width: 80%;
    height: 100%;
    top: 0;
    background-color: #1687ed;
    transform: skewX(-15deg);
    z-index: -1;
  }

  .container::after {
    right: 0;
    transform: skewX(15deg);
  }

  .form {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 1;
  }

  .input {
    width: 300px;
    margin-bottom: 15px; /* Cambio de espaciado */
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 16px;
    background-color: rgba(255, 255, 255, 0.3);
    color: white;
  }

  .form-label {
    font-weight: bold;
    margin-bottom: 6px;
    color: white;
  }

  .button {
    padding: 5px 10px; /* Cambio de tamaño */
    border: none;
    border-radius: 16px;
    cursor: pointer;
    font-weight: bold;
    text-transform: uppercase;
    transition: background-color 0.2s, color 0.2s;
    background-color: white;
    color: black;
    margin-right: 10px;
    font-size: 12px; /* Cambio de tamaño de letra */
  }

  .button:hover {
    background-color: #bebaba;
  }

  .link {
    color: white;
    text-decoration: none;
    margin-top: 10px;
  }

  .link:hover {
    text-decoration: underline;
  }

  .heading {
    color: white;
    margin-bottom: 20px;
  }

  .google-login {
    margin-top: 20px;
  }

  /* Cambio de color del placeholder */
  ::placeholder {
    color: white;
  }
</style>
