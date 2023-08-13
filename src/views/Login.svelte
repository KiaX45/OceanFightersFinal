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

  //Arreglo con las UID de los administradores
  const adminUid = ["rrXXm7j0UNbo5qdb10SFgp84Co82", "UgTZ9HuP1Og66qii9of6WbCKuzD2"];

  let email = "";
  let password = "";
  let username = "";
  let nombreUsuarioyaRegistrado = false;
  

  //Función para registrar un usuario

  function handleSubmit() {
  
  }
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
      showMistake("The user or the password is incorrect");
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
  const showMistake = (mensaje) => {
    Toastify({
      text: mensaje,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "center",
      backgroundColor: "#ff0000",
      stopOnFocus: true,
    }).showToast();
  };
  //funciones para mopstrar notificaciones de exito
  const showSuccess = (mensaje) => {
    Toastify({
      text: mensaje,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "center",
      backgroundColor: "#00ff00",
      stopOnFocus: true,
    }).showToast();
  };
</script>
<body>
<div class="container">
  <form class="form" on:submit|preventDefault={handleSubmit}>
    {#if !emailAndpassword}
      <h1 class="heading">Registrarse</h1>
      <label class="form-label" for="username">Usuario</label>
      <input class="input" placeholder="Nombre de Usuario" bind:value={username} />
    {:else}
      <h1 class="heading">Inicio de Sesion</h1>
    {/if}

    <label class="form-label" for="email">Email</label>
    <input class="input" type="email" placeholder="Email" bind:value={email} />

    <label class="form-label" for="password">Contraseña</label>
    <input class="input" type="password" placeholder="Contraseña" bind:value={password} />

    {#if !emailAndpassword}
      <button class="button primary" type="submit" on:click={registrarseConEmailPassword}>Crear Cuenta</button>
      <a class="link" href="#" on:click|preventDefault={changeEmailAndPassword}>Ingrese con una cuenta ya existente</a>
    {:else}
      <button class="button primary" type="submit" on:click={login}>Iniciar sesión</button>
      <a class="link" href="#" on:click|preventDefault={changeEmailAndPassword}>Cree una cuenta</a>
    {/if}

    <div class="google-login">
      <a href="URL_DE_INICIO_DE_SESION_DE_GOOGLE">
        <button class="button secondary" on:click={accederConGoogle}>Ingresar con Google</button>
      </a>
    </div>
  </form>
</div>
</body>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #1687ED;
  }
  body {
    background-color: #1687ED;
  }

  .form {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  }

  .input {
    width: 300px;
    margin-bottom: 10px;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }

  .form-label {
    font-weight: bold;
    margin-bottom: 6px;
    color: #1687ED;
  }

  .button {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    text-transform: uppercase;
    transition: background-color 0.2s, color 0.2s;
  }

  .primary {
    background-color: #007bff;
    color: #ffffff;
  }

  .secondary {
    background-color: #09ACD6;
    color: #ffffff;
  }

  .button:hover {
    background-color: #0056b3;
  }

  .link {
    color: #09ACD6;
    text-decoration: none;
    margin-top: 10px;
  }

  .link:hover {
    text-decoration: underline;
  }

  .heading {
    color: #1687ED;
    margin-bottom: 10px;
  }

  .google-login {
    margin-top: 20px;
  }
</style>
