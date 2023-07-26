<script>
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
</script>

<h1>Home</h1>
<h1>Estoy Home</h1>
<button on:click={diHola}> diHola</button>
