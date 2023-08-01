<script lang="js">
  import { user, admin } from "./stores/User";
  import { Router, Link, Route, navigate } from "svelte-routing";
  import { onMount } from "svelte";
  import { auth } from "./firebase";
  import { signOut } from "firebase/auth";
  import { onAuthStateChanged } from "firebase/auth";

  //Importamos los modulos de las vistas
  import Login from "./views/Login.svelte";
  import Home from "./views/Home.svelte";
  import Perfil from "./views/Perfil.svelte";

  //Importamos Navbar y Footer
  import Navbar from "./components/Navbar.svelte";
  import Footer from "./components/Footer.svelte";

  //Importamos los modulos necesarios para mostrar notificaciones
  import Toastify from "toastify-js";

  //Importamos los modulos de restaurante tanto de usuario como de administrador
  import Restaurante from "./views/Restaurante.svelte";
  import AdicionRestaurantes from "./views/Admin/AdiciónRestaurantes.svelte";
  import AdicionMenus from "./views/Admin/AdiciónMenus.svelte";

  //Importamos los modulos de avistamientos
  import Avistamientos from "./views/Avistamientos.svelte";
  import ComprobacionAvistamientos from "./views/Admin/ComprobaciónAvistamientos.svelte";

  //importamos los modulos de Eventos
  import Eventos from "./views/Eventos.svelte";
  import Evento from "./views/User/Evento.svelte";

  //Creamos un array con los uid de los administradores

  const adminUid = ["rrXXm7j0UNbo5qdb10SFgp84Co82"];

  onAuthStateChanged(auth, (authUser) => {
    if (!authUser) {
      cerrarSesion();
      return;
    }
    if (adminUid.includes(authUser.uid)) {
      admin.setAdmin(authUser);
      console.log($admin);
    } else {
      user.setUser(authUser);
      console.log($user);
    }
  });

  onMount(() => {
    if (!$user) {
      navigate("/", { replace: true });
    }
  });

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      user.setUser(null);
      navigate("/", { replace: true });
      console.log("se ha cerrado cesión con exito");
    } catch (error) {
      console.log(error.message);
    }
  };
</script>

<body>
  <div>
    <Router>
      <Navbar />

      <!--Creamos las rutas de las vistas de todos los usuarios-->
      <Route path="/"><Home /></Route>
      <Route path="/login"><Login /></Route>
      <Route path="/perfil"><Perfil /></Route>
      <Route path="/restaurante"><Restaurante /></Route>
      <Route path="/avistamientos"><Avistamientos /></Route>
      <Route path="/eventos"><Eventos /></Route>
      <!--Creamos las rutas para las vistas de los usuarios verificados-->
      <Route path="/evento"><Evento /></Route>
      <!--Creamos las vistas de los administradores-->
      <Route path="/adicionrestaurantes"><AdicionRestaurantes /></Route>
      <Route path="/adicionmenus"><AdicionMenus /></Route>
      <Route path="/comproavistamientos"><ComprobacionAvistamientos /></Route>
    </Router>
    <Footer />
  </div>
</body>

<style>
</style>
