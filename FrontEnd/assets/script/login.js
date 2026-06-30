togglePassword();
listenLoginForm();

//crée la fonction pour l'appuis sur l'oueil
// pour cacher ou voir le mot de passe
function togglePassword() {
  const toggleBtn = document.querySelector(".toggle-password");
  const passwordInput = document.querySelector("#password");
  const icon = document.querySelector(".fa-solid");

  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();

    console.log("clique sur oueil");
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
}

//Création de l'écoute pour l'envoi du formulaire login
function listenLoginForm() {
  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault(); // empêche le rechargement de la page

    const email = document.getElementById("email").value;
    const userPassword = document.getElementById("password").value;

    if (!email) {
    }

    sendLoginRequest(email, userPassword);
  });
}

//Validation du mot de passe et reupération du token pour
//  le mettre dans le session storage
async function sendLoginRequest(email, userPassword) {
  //envoie de la requete pour vaalidation et reucperation du token
  const reponse = await fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    body: JSON.stringify({
      email: email,
      password: userPassword,
    }),

    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const errorMessage = document.getElementById("error-message");

  switch (reponse.status) {
    case 200:
      const data = await reponse.json();

      console.log(reponse.status);

      //Recupération du token
      const token = data.token;
      console.log("token de connexion : ", token);

      //Enregistrement du token dans la session Storage
      //La session Strorage sera vider en cas de
      // fermeture du site par le navigateur
      sessionStorage.setItem("token", data.token);
      window.location.href = "../index.html";
      break;
    case 401:
      errorMessage.style.display = "block";
      errorMessage.textContent =
        "Autorisation insufisante pour accéder au mode edition.";
      break;
    case 402:
      errorMessage.style.display = "block";
      errorMessage.textContent = "Email ou mot de passe incorrect";
      break;
    default:
      errorMessage.style.display = "block";
      errorMessage.textContent = "Connexion serveur impossible.";
      break;
  }
}
