<script>
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
</script>

<div>
  <h1>Test 1</h1>
  <Router>
    <Navbar />

    <!--Creamos las rutas de las vistas-->
    <Route path="/"><Home /></Route>
    <Route path="/login"><Login /></Route>
    <Route path="/perfil"><Perfil /></Route>
  </Router>
  <Footer />
</div>

<style>
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
</style>
