//Récupération des éléments du DOM
const modalGallery = document.querySelector(".modal-gallery");
const modalAdd = document.querySelector(".modal-add");
const galleryHtml = document.getElementById("gallery");
const formSelect = document.getElementById("category");

//Récupération de toutes la gallerie sur l'API et ajout de toutes la gallerie dans la page
async function worksRecovery() {
  try {
    const reponse = await fetch("http://localhost:5678/api/works");
    const gallerieApi = await reponse.json();

    //Vide la gallerie avant de la remplir avec les nouvelles données
    galleryHtml.innerHTML = "";

    //Pour chaque élément de la gallerie on créer une figure 
    // avec l'image et le titre
    for (let i = 0; i < gallerieApi.length; i++) {
      const workImg = document.createElement("img");
      const workTitle = document.createElement("figcaption");

      workImg.src = gallerieApi[i].imageUrl;
      workTitle.textContent = gallerieApi[i].title;

      const work = document.createElement("figure"); //figure qui contient chaque travail
      work.dataset.category = gallerieApi[i].category.name; //ajout d'un dataset pour la category pour le filtre
      work.dataset.id = gallerieApi[i].id;//Récupération de l'id du travail dans l'API

      work.appendChild(workImg);
      work.appendChild(workTitle);

      galleryHtml.appendChild(work);
    }
  } catch (error) {
    console.log("Chargement de la gallerie echouée");
    console.error("Erreur : ", error);
  }
}

//Recuperation des catégorie et création d'un bouton de filtre par cattégorie
function categoryRecovery() {
  const button_container = document.querySelector(".button_container");
  const set = new Set();

  galleryHtml.childNodes.forEach((element) => {
    set.add(element.dataset.category); //ajout de la catergorie au set eviter les doublons
  });
console.log(set);
  //Création d'un bouton et d'un listener pour chaque categorie
  set.forEach((category) => {
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

function test() {
  console.log("fonction teste lancer");
  viewModalAdd();
}

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
//Ce lance à chaque fois que la page est rechargée
async function ModeVerification() {
  
  await worksRecovery(); 
  categoryRecovery();

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

//Ouverture de la modale
function openModale() {
  document.querySelector("dialog").showModal();
  viewModalGallery(); //affiche la modale gallerie par défaut

  //Recupération de toutes les figure de la gallerie et
  // de la div qui contiendra les figure de la modale
  const works = Array.from(document.getElementById("gallery").children);
  const container_works = document.querySelector(".work_model_container");

  container_works.innerHTML = ""; //On vide le container pour ne pas avoir de doublon

  //Pour chaque figure de la gallerie on clone la figure et on supprime le figcaption
  works.forEach((fig) => {
    const figClone = fig.cloneNode(true);
    const caption = figClone.querySelector("figcaption");

    //Si il y a un figcaption on le supprime du clone pour ne garder que l'image
    if (caption) figClone.removeChild(caption);

    figClone.insertAdjacentHTML(
      "afterbegin",
      `
    <div class="trash-can-icon">
      <i class="fa-solid fa-trash-can"></i>
    </div>
  `,
    );

    //Ajout d'un listener sur l'icone poubelle pour supprimer
    //  la figure du modal et de l'API
    figClone.querySelector(".trash-can-icon").addEventListener("click", (e) => {
      e.preventDefault();
      figClone.remove(); // supprime la figure du modal
      const id = figClone.dataset.id;
      deleteWork(id);
    });

    container_works.appendChild(figClone);
  });
}

//Fermeture de la modale
function closeModale() {
  document.querySelector("dialog").close();
}
//Affichage de la modale d'ajout et masquage de la modale gallerie
function viewModalAdd() {
  modalGallery.classList.add("hidden");
  modalAdd.classList.remove("hidden");
  document.getElementById("retour").classList.remove("hidden");
  
  //Récupération des catégories pour le select du formulaire
  addCategoriesForm(); 
}
//Affichage de la modale gallerie et masquage de la modale d'ajout
function viewModalGallery() {
  modalGallery.classList.remove("hidden");
  modalAdd.classList.add("hidden");
  document.getElementById("retour").classList.add("hidden");
}

async function addWorkToGallery(e) {
  e.preventDefault();

  const formData = new FormData();

  const inputPhoto = document.getElementById("input-photo").files[0];
  const titleInput = document.getElementById("title").value;
  const categoryInput = document.getElementById("category").value;

  formData.append("image", inputPhoto);
  formData.append("title", titleInput);
  formData.append("category", categoryInput);

  console.log(categoryInput);

  if (!inputPhoto) {
    console.error("Aucun fichier sélectionné !");
    return;
  }

  const reponse = await fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!reponse.ok) {
    const texteErreur = await reponse.text();
    console.error("Détail de l'erreur :", texteErreur);
  }

  console.log(
    `| Envois de l'image          |
     | Satut : ${reponse.status}  |
     | reponse : ${reponse.text}  |  
  `,
  );

  worksRecovery();
}

//Ecouteur d'événement pour vérifier si le formulaire est rempli
function LisenPageLoad() {
  const inputPhoto = document.getElementById("input-photo");
  const titre = document.getElementById("title");
  const categorie = document.getElementById("category");
  const boutonValider = document.querySelector(".btn_valider");

  function verifierFormulaire() {
    if (
      inputPhoto.files.length > 0 &&
      titre.value.trim() !== "" &&
      categorie.value !== ""
    ) {
      boutonValider.disabled = false;
    } else {
      boutonValider.disabled = true;
    }
  }

  // Ajout des écouteurs d'événements pour vérifier le formulaire à chaque changement
  inputPhoto.addEventListener("change", verifierFormulaire);
  titre.addEventListener("input", verifierFormulaire);
  categorie.addEventListener("change", verifierFormulaire);
}

//Fonction pour supprimer un travail de la gallerie
async function deleteWork(id) {

 const reponse= await fetch(`http://localhost:5678/api/works/${id}`, {
  method : "DELETE",
  headers : {
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  }


 });

 if (!reponse.ok) {
    const texteErreur = await reponse.text();
    console.error("Détail de l'erreur :", texteErreur);
  }

  console.log(
    `| Envois de l'image          |
     | Satut : ${reponse.status}  |
     | reponse : ${reponse.text}  |  
  `,
  );

worksRecovery();
}

//Fonction pour ajouter les catégories dans le select du formulaire d'ajout
async function addCategoriesForm() {
  try {
    const reponse = await fetch("http://localhost:5678/api/categories");
    
    if (!reponse.ok) {
      throw new Error("Erreur lors de la récupération des catégories");
    }
    
    formSelect.innerHTML = ""; // Vide le select avant de le remplir avec les nouvelles données
    const categories = await reponse.json();
    

    categories.forEach(categorie => {
      const option = document.createElement("option");
      option.value = categorie.id;
      option.textContent = categorie.name;
      formSelect.appendChild(option);
    });

  } catch (erreur) {
    console.error(erreur);
  }
}




//************************Code lancer au démmarrage***********************

//Ajout de l'écoute quand la page est chargées afin de vérifier si le mode
// edition est activé en fonction du token du session storage
document.addEventListener("DOMContentLoaded", ModeVerification);

//Ajout de l'écoute sur le texte de log, qui prend deux valeur login ou logout
document.getElementById("login-text").addEventListener("click", selectLog);

//Bouton fermer de la modale
document.querySelector("#fermer").addEventListener("click", closeModale);

//Ajout de l'écoute du bouton modifier en mode edition pour ouvrir la modale
document.querySelector(".container-button-modif").addEventListener("click", openModale);

//Pour le teste de fonction
document.getElementById("test").addEventListener("click", test);

//Ajout de l'écoute du bouton ajouter pour ouvrir la modale d'ajout d'image
document.querySelector(".btn_ajouter").addEventListener("click", viewModalAdd);

//Ajout de l'écoute du bouton retour pour revenir à la modale gallerie
document.getElementById("retour").addEventListener("click", viewModalGallery);

document
  .getElementById("form-ajout-photo")
  .addEventListener("submit", addWorkToGallery);

LisenPageLoad();
