<script>
  import { Link, navigate } from "svelte-routing";
</script>

<footer class="footer">
  <div class="footer-1 container">
    <ul>
      <li><a href="#">Inicio</a></li>
      <li><a href="#">Ecosistema Marino</a></li>
      <li><a href="#">Equipo</a></li>
      <li><a href="#">Testimonios</a></li>
      <li><a href="#">Contactos</a></li>
    </ul>
  </div>
  <div class="footer-content footer-2">
    <div class="footer-logo">Ocean Fighters</div>
    <div class="footer-links" />
    <div class="footer-social" />
    <div class="footer-credit">© 2023 Todos los derechos reservados</div>
  </div>
</footer>

<style>
  footer {
    width: 100%;
  }
  .footer {
    padding: 20px;
    text-align: center;
    bottom: 0;
  }

  .footer-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .footer-logo {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .footer-links {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
  }

  .footer-social {
    margin-bottom: 10px;
  }

  .footer-credit {
    color: #666;
    font-size: 14px;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .footer {
    padding-top: 40px;
    background-color: #14375A;
  }

  .footer-1 {
    padding-bottom: 40px;
  }

  .footer-1 ul {
    display: flex;
    justify-content: space-between;
  }

  .footer-1 ul li a {
    color: #fefffb;
    text-decoration: none;
  }

  .footer-1 ul li a:hover {
    color: #EFBC70;
  }

  .footer-2 {
    padding: 15px;
    text-align: center;
    color: #fefffb;
    background-color: #14375A;
  }
</style>
