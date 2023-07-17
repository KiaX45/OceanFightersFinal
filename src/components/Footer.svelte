<script>
    import { Link, navigate } from "svelte-routing";
</script>

<footer class="footer">
  <div class="footer-content">
    <div class="footer-logo">Mi Sitio Web</div>
    <div class="footer-links">
     
    </div>
    <div class="footer-social">
      
    </div>
    <div class="footer-credit">© 2023 Todos los derechos reservados</div>
  </div>
</footer>

<style>
  .footer {
    background-color: #f0f0f0;
    padding: 20px;
    text-align: center;
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
</style>

