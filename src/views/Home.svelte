<script>
  //importamos onmount
  import { onMount } from "svelte";

  //importamos bootstrap y toastify
  import Toastify from "toastify-js";
  const diHola = () => {
    Toastify({
      text: "Hola",
      duration: 3000,
      close: true,
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
      },
    }).showToast();
    console.log("Hola");
  };

  let datos;

  //creamos la función de conexión con el servidor
  const conexion = async () => {
    try {
        const respuesta = await fetch('https://oceanfightersserver.onrender.com/ping');
        if (respuesta.ok) {
            datos = await respuesta.json();
            console.log("Datos obtenidos:", datos);
        } else {
            console.error("Error al obtener datos:", respuesta.statusText);
        }
    } catch (error) {
        console.error("Error al realizar la solicitud:", error);
    }
  };

  //creamos onmount
  onMount(() => {
    //llamamos la función de conexión con el servidor
    conexion();
  });
</script>

<body>
  <div class="medina">
    <button on:click={diHola}> diHola</button>
  </div>

  <header class="header">
    <div class="menu container">
      <input type="checkbox" id="menu" />
      <label for="menu">
        <img src="" class="menu-icono" alt="" />
      </label>
    </div>

    <div class="header-content container">
      <div class="header-txt">
        <h1 class="slide-in-top">Ocean Fighters</h1>
        <p>
          ¿Que es Ocean Fighters? <br />
          Los océanos, que cubren aproximadamente el 71% de la superficie terrestre,
          son fundamentales para la vida en la Tierra. Son la fuente de biodiversidad,
          regulan el clima global y proporcionan recursos esenciales para la supervivencia
          humana y de numerosas especies. Sin embargo, los océanos enfrentan una
          crisis sin precedentes debido a la creciente interferencia humana, que
          ha llevado a una serie de problemas medioambientales alarmantes. Una empresa
          que ha tomado una postura activa en la lucha contra esta devastación es
          "Ocean Fighters".
        </p>
        <a href="#informacion" class="btn-1"> Más Información</a>
      </div>
    </div>
  </header>

  <section class="general container">
    <h2>El ecosistema marítimo</h2>

    <div class="general-content">
      <div class="general-1 txt">
        <h3>¿Sabías que?</h3>
        <p>
          Anualmente, 11 millones de toneladas de residuos plásticos entran a
          los océanos contaminando los ecosistemas marítimos y arrasando toda
          vida marítima a su paso.
        </p>
      </div>
      <div class="general-2 txt">
        <h3>Dato curioso</h3>
        <p>
          Los océanos son una de las principales reservas de biodiversidad en el
          mundo. Constituyen más del 90% del espacio habitable del planeta y
          contienen unas 250.000 especies conocidas.
        </p>
      </div>
      <div class="general-3 txt">
        <h3>¿Sabías que?</h3>
        <p>
          El fitoplancton presente en los océanos (y no los bosques, como se
          cree habitualmente) producen entre el 50% y el 85 % del oxígeno que se
          libera cada año a la atmósfera.
        </p>
      </div>
    </div>
  </section>

  <section class="info-1">
    <div class="info-content container">
      <h2 id="informacion">Información</h2>

      <div class="info-circle">
        <div class="circle-txt">
          <div class="circle-1">
            <h3 class="wobble-hor-bottom">13M TN</h3>
          </div>
          <p class="wobble-hor-bottom">
            Gracias a la ayuda de Ocean fighters y de todos las personas que han
            ayudado y colaborado se ha logrado recoger cerce de 12,7 millones de
            toneladas de basura de todos los oceanos y mares
          </p>
        </div>
        <div class="circle-txt">
          <div class="circle-1">
            <h3 class="wobble-hor-bottom">90.5%</h3>
          </div>
          <p class="wobble-hor-bottom">
            Cerca del 91% de la area de todo los oceanos y mares está salva
            guardada contra la pesca excesiva, esto para prevenir que la vida
            maritima disminuya considerablemente a tal punto que la vida
            maritima cambie.
          </p>
        </div>
        <div class="circle-txt">
          <div class="circle-1">
            <h3 class="wobble-hor-bottom">100+</h3>
          </div>
          <p class="wobble-hor-bottom">
            Más de 100 restaurantes ha n sido verificados por el equipo y la
            comunidad de Ocean fighters como restaurantes certificados cons su
            compromiso con la preservación de la fauna marítima.
          </p>
        </div>
        <div class="circle-txt">
          <div class="circle-1">
            <h3 class="wobble-hor-bottom">28.1M KM</h3>
          </div>
          <p class="wobble-hor-bottom">
            Se estima que ya hay alrededor de 28.1 millones de kilometros que
            están protegidos contra la pesca y conservación de su vida maritima
            en todo el mundo, contando con constante vigilancia de la guardía
            costera
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="general g2 container">
    <h2>Recursos importantes</h2>

    <div class="general-content">
      <div class="general-4 txt">
        <iframe
          width="370"
          height="250"
          src="https://www.youtube.com/embed/OC4V4nhyt8Y"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        />
      </div>
      <div class="general-5 txt">
        <iframe
          width="370"
          height="250"
          src="https://www.youtube.com/embed/YRUZzQqqHBw"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        />
      </div>
      <div class="general-6 txt">
        <iframe
          width="370"
          height="250"
          src="https://www.youtube.com/embed/h9Lw2wpZEwE"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        />
      </div>
    </div>
  </section>

  <section class="info-2">
    <div class="info-content container">
      <h2>Testimonios</h2>
      <div class="testi">
        <div class="testi-left">
          <div class="testi-txt">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Home%2Ft1.png?alt=media&token=c3c74d2d-4df2-43b3-8896-31d510e458c7"
              alt=""
            />
            <h3>Juliana</h3>
            <p>
              "Una organización en la que comence desde que visite las playas de
              mi país y pude observar como estaban llenas de basura en su
              maypría de plastico y ver como animalitos se enredaban con estas
              basuras; me hizo sentir que debia ayudar en lo posible en su
              cuidado."
            </p>
          </div>
          <div class="testi-txt">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Home%2Ft2.png?alt=media&token=9fcb4fe0-8e0a-4e29-bdb2-1b42b6680a81"
              alt=""
            />
            <h3>Jorge</h3>
            <p>
              "Mi tiempo en esta organización ha sido una travesía apasionante.
              Colaborar en la restauración de arrecifes coralinos y en la
              concienciación sobre la contaminación plástica marina me ha
              llenado de orgullo. Cada paso cuenta para proteger nuestro
              preciado ecosistema marítimo y dejar un legado positivo para las
              futuras generaciones."
            </p>
          </div>
        </div>
        <div class="testi-right">
          <div class="testi-txt">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Home%2Ft3.png?alt=media&token=7d411d9f-515b-49f0-9679-ac8e50210efb"
              alt=""
            />
            <h3>Samantha</h3>
            <p>
              "Trabajar en esta organización ha sido una experiencia increíble.
              Cada día, contribuimos activamente a la preservación del
              ecosistema marítimo a través de acciones concretas, desde la
              limpieza de playas hasta la promoción de prácticas pesqueras
              sostenibles. Saber que mi esfuerzo marca una diferencia real en la
              salud de nuestros océanos es verdaderamente gratificante."
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</body>

<style>
  .medina {
    display: none;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    text-decoration: none;
    list-style: none;
  }

  body {
    min-height: 100vh;

    background: -webkit-linear-gradient(
      -180deg,
      rgb(22, 135, 237),
      rgb(8, 37, 67)
    );
    background: linear-gradient(-180deg, rgb(22, 135, 237), rgb(8, 37, 67));
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    background-image: url(https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Home%2Foceanfighterhome.jpg?alt=media&token=7c27a0fb-0a42-416e-a60d-f6c0b9f1e6ad);
    background-position: center bottom;
    background-repeat: no-repeat;
    background-size: cover;
    min-height: 120vh;
    align-items: center;
    display: flex;
  }

  .menu {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 1000;
  }

  .logo {
    color: #fff;
    font-size: 25px;
    font-weight: 800;
  }

  .menu .navbar ul li a {
    font-size: 18px;
    padding: 20px;
    color: #fff;
    display: block;
    font-weight: 600;
  }

  #menu {
    display: none;
  }

  .menu-icono {
    width: 25px;
  }

  .menu label {
    cursor: pointer;
    display: none;
  }

  .header-txt {
    text-align: center;
  }

  .header-txt h1 {
    font-size: 85px;
    color: #a37125;
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  .header-txt p {
    color: #fff;
    font-size: 16px;
    padding: 0 250px;
    margin-bottom: 45px;
  }

  .btn-1 {
    display: inline-block;
    padding: 12px 45px;
    border: 1px solid #fff;
    color: #fff;
    font-size: 16px;
    text-transform: uppercase;
    font-weight: 600;
  }

  .btn-1:hover {
    color: #1b293a;
    background-color: #fff;
  }

  .general {
    padding: 50px 0;
    text-align: center;
  }

  .general-content {
    display: flex;
    justify-content: space-between;
    margin-top: 55px;
  }

  .general-1 {
    background-image: url(https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Home%2Ftortuga%20circular%202.png?alt=media&token=298cb1b5-4bf6-40eb-8322-8b13f8606f92);
    background-position: center center;
    background-position: no-repeat;
    background-size: cover;
    height: 450px;
    padding: 170px 55px;
  }

  .general-2 {
    background-image: url(https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Home%2Ftortuga%20circular%202.png?alt=media&token=298cb1b5-4bf6-40eb-8322-8b13f8606f92);
    background-position: center center;
    background-position: no-repeat;
    background-size: cover;
    height: 450px;
    padding: 170px 55px;
  }

  .general-3 {
    background-image: url(https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Home%2Ftortuga%20circular%202.png?alt=media&token=298cb1b5-4bf6-40eb-8322-8b13f8606f92);
    background-position: center center;
    background-position: no-repeat;
    background-size: cover;
    height: 450px;
    padding: 170px 55px;
  }

  .general-4 {
    background-image: url(https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Home%2Fr1.png?alt=media&token=5ebfdd45-a015-480a-82e9-922d29aaaaaa);
    background-position: center center;
    background-position: no-repeat;
    background-size: cover;
    height: 450px;
    padding: 170px 20px;
  }

  .general-5 {
    background-image: url(https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Home%2Fr1.png?alt=media&token=5ebfdd45-a015-480a-82e9-922d29aaaaaa);
    background-position: center center;
    background-position: no-repeat;
    background-size: cover;
    height: 450px;
    padding: 170px 20px;
  }

  .general-6 {
    background-image: url(https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Home%2Fr1.png?alt=media&token=5ebfdd45-a015-480a-82e9-922d29aaaaaa);
    background-position: center center;
    background-position: no-repeat;
    background-size: cover;
    height: 450px;
    padding: 170px 20px;
  }

  h2 {
    font-size: 70px;
    text-transform: uppercase;
    color: #1b293a;
  }

  .txt h3 {
    font-size: 18px;
    color: #fff;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .txt p {
    color: #bebebe;
    font-size: 16px;
  }

  .info-1 {
    padding: 250px 0;
    background-image: url(https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Home%2Fbg2.png?alt=media&token=5519f3ca-0b80-42d5-8dbd-e0bde9845330);
    background-position: center center;
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }

  .info-content {
    text-align: center;
  }

  .info-content h2,
  span {
    color: #fff;
  }

  .info-circle {
    display: flex;
    justify-content: space-between;
    margin-top: 55px;
  }

  .circle-txt {
    width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin: 0 10px;
  }

  .circle-1 {
    height: 100px;
    width: 100px;
    border: 1px solid #fff;
    border-radius: 50%;
    padding-top: 35px;
  }

  .circle-1 h3 {
    color: #bebebe;
    font-size: 16px;
  }

  .circle-txt p {
    color: #fff;
    margin-top: 25px;
  }

  .info-2 {
    padding: 250px 0;
    background-image: url(https://firebasestorage.googleapis.com/v0/b/ocean-ad72b.appspot.com/o/Home%2Fbg3.png?alt=media&token=feab39f6-7669-4529-b0d6-bb0bb9d8a2a7);
    background-position: center center;
    background-size: 100% 100%;
  }

  .testi {
    display: flex;
    align-items: center;
    text-align: left;
    margin-top: 35px;
  }

  .testi-left {
    width: 50%;
    padding-right: 25px;
  }

  .testi-right {
    width: 50%;
    padding-left: 35px;
  }

  .testi-txt {
    margin-bottom: 25px;
  }

  .testi-txt img {
    width: 50px;
    margin-bottom: 15px;
  }

  .testi-txt h3 {
    font-size: 20px;
    color: #fff;
  }

  .testi-txt p {
    color: #bebebe;
    font-size: 16px;
  }

  .slide-in-top {
    -webkit-animation: slide-in-top 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)
      both;
    animation: slide-in-top 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
  /* ----------------------------------------------
 * Generated by Animista on 2023-8-12 15:55:1
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

  /**
 * ----------------------------------------
 * animation slide-in-top
 * ----------------------------------------
 */
  @-webkit-keyframes slide-in-top {
    0% {
      -webkit-transform: translateY(-1000px);
      transform: translateY(-1000px);
      opacity: 0;
    }
    100% {
      -webkit-transform: translateY(0);
      transform: translateY(0);
      opacity: 1;
    }
  }
  @keyframes slide-in-top {
    0% {
      -webkit-transform: translateY(-1000px);
      transform: translateY(-1000px);
      opacity: 0;
    }
    100% {
      -webkit-transform: translateY(0);
      transform: translateY(0);
      opacity: 1;
    }
  }

  .slide-in-top1 {
    -webkit-animation: slide-in-top 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)
      both;
    animation: slide-in-top 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
  /* ----------------------------------------------
 * Generated by Animista on 2023-8-13 22:5:48
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

  /**
 * ----------------------------------------
 * animation slide-in-top
 * ----------------------------------------
 */
  @-webkit-keyframes slide-in-top1 {
    0% {
      -webkit-transform: translateY(-1000px);
      transform: translateY(-1000px);
      opacity: 0;
    }
    100% {
      -webkit-transform: translateY(0);
      transform: translateY(0);
      opacity: 1;
    }
  }
  @keyframes slide-in-top1 {
    0% {
      -webkit-transform: translateY(-1000px);
      transform: translateY(-1000px);
      opacity: 0;
    }
    100% {
      -webkit-transform: translateY(0);
      transform: translateY(0);
      opacity: 1;
    }
  }

  .wobble-hor-bottom:hover {
    -webkit-animation: wobble-hor-bottom 0.8s both;
    animation: wobble-hor-bottom 0.8s both;
  }

  /* ----------------------------------------------
 * Generated by Animista on 2023-8-14 20:41:10
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

  /**
 * ----------------------------------------
 * animation wobble-hor-bottom
 * ----------------------------------------
 */
  @-webkit-keyframes wobble-hor-bottom {
    0%,
    100% {
      -webkit-transform: translateX(0%);
      transform: translateX(0%);
      -webkit-transform-origin: 50% 50%;
      transform-origin: 50% 50%;
    }
    15% {
      -webkit-transform: translateX(-30px) rotate(-6deg);
      transform: translateX(-30px) rotate(-6deg);
    }
    30% {
      -webkit-transform: translateX(15px) rotate(6deg);
      transform: translateX(15px) rotate(6deg);
    }
    45% {
      -webkit-transform: translateX(-15px) rotate(-3.6deg);
      transform: translateX(-15px) rotate(-3.6deg);
    }
    60% {
      -webkit-transform: translateX(9px) rotate(2.4deg);
      transform: translateX(9px) rotate(2.4deg);
    }
    75% {
      -webkit-transform: translateX(-6px) rotate(-1.2deg);
      transform: translateX(-6px) rotate(-1.2deg);
    }
  }
  @keyframes wobble-hor-bottom {
    0%,
    100% {
      -webkit-transform: translateX(0%);
      transform: translateX(0%);
      -webkit-transform-origin: 50% 50%;
      transform-origin: 50% 50%;
    }
    15% {
      -webkit-transform: translateX(-30px) rotate(-6deg);
      transform: translateX(-30px) rotate(-6deg);
    }
    30% {
      -webkit-transform: translateX(15px) rotate(6deg);
      transform: translateX(15px) rotate(6deg);
    }
    45% {
      -webkit-transform: translateX(-15px) rotate(-3.6deg);
      transform: translateX(-15px) rotate(-3.6deg);
    }
    60% {
      -webkit-transform: translateX(9px) rotate(2.4deg);
      transform: translateX(9px) rotate(2.4deg);
    }
    75% {
      -webkit-transform: translateX(-6px) rotate(-1.2deg);
      transform: translateX(-6px) rotate(-1.2deg);
    }
  }
</style>
