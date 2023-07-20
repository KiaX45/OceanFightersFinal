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

  //Arreglo con las UID de los administradores
  const adminUid = ["H0QDpxoMMWPD3WRSMvV9fGr1pEQ2"];

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
        console.log("Campos vacios");
        return;
      }
      verificarNombreDeUsuario();
      if (nombreUsuarioyaRegistrado) {
        alert("El nombre de usuario ya esta registrado");
        return;
      }
      auth.username = username;
      const resp2 = await createUserWithEmailAndPassword(auth, email, password);
      user.setUser(resp2.user);
      console.log($user);
      console.log($user.uid);
      llenarDatos();
      saveUser();
      navigate("/", { replace: true });
    } catch (error) {
      console.log(error.message);
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
        console.log("Campos vacios");
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
      navigate("/", { replace: true });
    } catch (error) {
      alert("The user or the password is incorrect");
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
</script>

<div class="container">
  <form class="form" on:submit|preventDefault={handleSubmit}>
    {#if !emailAndpassword}
      <input class="input" placeholder="UserName" bind:value={username} />
    {/if}

    <input class="input" type="email" placeholder="Email" bind:value={email} />
    <input
      class="input"
      type="password"
      placeholder="Password"
      bind:value={password}
    />

    {#if !emailAndpassword}
      <button
        class="button"
        type="submit"
        on:click={registrarseConEmailPassword}>Crear Cuenta</button
      >
      <a href="#" on:click|preventDefault={changeEmailAndPassword}
        >Ingrese con una cuenta ya existente</a
      >
    {:else}
      <button class="button" type="submit" on:click={login}
        >Iniciar sesión</button
      >
      <a href="#" on:click|preventDefault={changeEmailAndPassword}
        >Cree una cuenta</a
      >
    {/if}

    <div class="google-login">
      <a href="URL_DE_INICIO_DE_SESION_DE_GOOGLE">
        <button on:click={accederConGoogle}> Ingresar con Google</button>
      </a>
    </div>
  </form>
</div>



<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f0f0f0;
  }

  .form {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #ffffff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  }

  .input {
    width: 300px;
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .button {
    background-color: #007bff;
    color: #ffffff;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .button:hover {
    background-color: #0056b3;
  }

  .google-login {
    margin-top: 20px;
  }
</style>
