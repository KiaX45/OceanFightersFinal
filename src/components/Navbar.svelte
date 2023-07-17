<script>
  import { Link, navigate } from "svelte-routing";
  import { user, admin } from "../stores/User";

  import { signOut } from "firebase/auth";
  import { auth } from "../firebase";

  const gotoProfile = () => {
    console.log("Si");
    navigate("/perfil", { replace: true });
  };

  const goLogin = () => {
    console.log("Si");
    navigate("/login", { replace: true });
  };

   const cerrarSesion = async () => {
    try {
      await signOut(auth);
      user.setUser(null);
      navigate("/login", { replace: true });
      console.log("se ha cerrado cesión con exito");
    } catch (error) {
      console.log(error.message);
    }
  };
</script>

<!--Links para las vistas de todo el publico -->
<Link to="/">Inicio</Link>
<Link to="/login">Login</Link>
{#if $user}
   <!-- content here -->
   <Link to="/perfil">Perfil</Link>
{/if}

<!--Create a buuton with bootstrap danger-->
{#if !$user}
   <button class="btn btn-warning" on:click={goLogin}>Iniciar Sesión</button>
{:else}
   <button class="btn btn-danger" on:click={cerrarSesion}>Cerrar Sesión</button>
{/if}

