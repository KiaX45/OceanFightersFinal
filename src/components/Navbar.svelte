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
</script>

<!--Links para las vistas de todo el publico -->
<Link to="/">Inicio</Link>
<Link to="/login">Login</Link>
<Link to="/perfil">Perfil</Link>
