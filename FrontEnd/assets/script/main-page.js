//Récupération de toutes la gallerie sur l'API et ajout de toutes la gallerie dans la page
async function worksRecovery() {
  try {
    const reponse = await fetch("http://localhost:5678/api/works");
    const gallerieApi = await reponse.json();

    const galleryHtml = document.getElementById("gallery");
    const set = new Set();
    for (let i = 0; i < gallerieApi.length; i++) {
      const workImg = document.createElement("img");
      const workTitle = document.createElement("figcaption");

      workImg.src = gallerieApi[i].imageUrl;
      workTitle.textContent = gallerieApi[i].title;

      const work = document.createElement("figure"); //figure qui contient chaque travail
      work.dataset.category = gallerieApi[i].category.name; //ajout d'un dataset pour la category pour le filtre

      work.appendChild(workImg);
      work.appendChild(workTitle);

      galleryHtml.appendChild(work);

      set.add(gallerieApi[i].category.name); //ajout de la catergorie au set eviter les doublons
    }

    categoryRecovery(set); //envoie du set pour la création des bouton de filtre
  } catch (error) {
    console.log("Chargement de la gallerie echouée");
    console.error("Erreur : ", error);
  }
}

//Recuperation des catégorie et création d'un bouton de filtre par cattégorie
function categoryRecovery(setCatergory) {
  const button_container = document.querySelector(".button_container");

  //Création d'un bouton et d'un listener pour chaque categorie
  setCatergory.forEach((category) => {
    const button = document.createElement("button");
    button.textContent = category;

    button_container.appendChild(button);

    //Affiche toutes les figure qui on la bonne categorie et masque les autres
    button.addEventListener("click", () => {
      document.querySelectorAll("#gallery figure").forEach((fig) => {
        if (fig.dataset.category === category) {
          fig.classList.remove("hidden");
        } else {
          fig.classList.add("hidden");
        }
      });

      desactivated_button(button);
    });
  });

  //Ajout du listener pour le bouton "Tous"
  document.getElementById("button-all").addEventListener("click", (e) => {
    document.querySelectorAll("figure").forEach((fig) => {
      fig.classList.remove("hidden");
    });

    desactivated_button(e.target);
  });
}

//désactive le bouton activé
function desactivated_button(button) {
  const activeButton = document.querySelector(".button_active");

  //Le bouton actif devient inactif
  if (activeButton) {
    activeButton.classList.remove("button_active");
    activeButton.classList.add("button_inactive");
  }

  //Le bouton appuyer deviens actif
  button.classList.add("button_active");
  button.classList.remove("button_inactive");
}

function teste() {}

//Quand on click sur logout le token est supprimer du storage
// et la page est rechargée
//i le bouton est login il est redirigé vers la page de log
function selectLog() {
  const login_aref = document.getElementById("login-text");

  //si pas logé alors on va à la page de log
  if (login_aref.textContent === "Login") {
    window.location.href = "pages/login.html";
  } else {
    //sinon on supprimer le token et on change le texte en login
    if (sessionStorage.getItem("token")) {
      //Suppression du token
      sessionStorage.removeItem("token");
    }

    //Recharge de la page, apelle de la fonction ListenPageLoad
    location.reload();
  }
}

//Change le mode de la page entre edition et visiteur
//si true le mode sera en edition
//si false le mode sera en visiteur
async function ModeVerification() {
  await worksRecovery();

  //Récupération de la banniére édition
  const editionBanner = document.querySelector(".edition-mode");

  //Récupération du texte "login"
  const login_aref = document.getElementById("login-text");

  const button_container = document.querySelector(".button_container");
  const container_button_modif = document.querySelector(
    ".container-button-modif",
  );

  //si il y a le token alors on active le mode edition, affichage de la banniére
  //MODE EDITION
  if (sessionStorage.getItem("token")) {
    editionBanner.classList.remove("hidden"); //afficher la banniére edition

    login_aref.textContent = "Logout"; //le bouton login deviens logout

button_container.innerHTML = "";

   

    //MODE VISITEUR
  } else {
    editionBanner.classList.add("hidden"); //afficher la banniére edition

    login_aref.textContent = "Login"; //le bouton login deviens logout

    button_container.classList.remove("hidden");
    container_button_modif.classList.add("hidden");
  }
}

//Ajout de l'écoute quand la page est chargées afin de vérifier si le mode
// edition est activé en fonction du token du session storage
document.addEventListener("DOMContentLoaded", ModeVerification);

//Ajout de l'écoute sur le texte de log, qui prend deux valeur login ou logout
document.getElementById("login-text").addEventListener("click", selectLog);
