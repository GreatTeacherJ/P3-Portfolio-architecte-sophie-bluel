//Taille de l'image max accépté
const MAX_SIZE = 4 * 1024 * 1024;
//type fichier accépté
const ALLOWED_FILE_TYPE = ["image/png", "image/jpeg"];

//Récupération des éléments du DOM
const modalGallery = document.querySelector(".modal-gallery");
const modalAdd = document.querySelector(".modal-add");
const galleryHtml = document.getElementById("gallery");
const formSelect = document.getElementById("category");
let allWorks = [];

//Récupération de toutes la gallerie sur l'API et ajout de toutes la gallerie dans la page
async function retrieveWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    const galleryApi = await response.json();

    //Vide la gallerie avant de la remplir avec les nouvelles données
    galleryHtml.innerHTML = "";

    //Pour chaque élément de la gallerie on créer une figure
    // avec l'image et le titre
    galleryApi.forEach((work) => {
      galleryHtml.appendChild(createFigure(work));
    });

    allWorks = galleryApi;
  } catch (error) {
    console.log("Chargement de la gallerie echouée");
    console.error("Erreur : ", error);
  }
}

//Recuperation des catégorie et création d'un bouton de filtre par cattégorie
function retrieveCategory() {
  const button_container = document.querySelector(".button_container");
  const set = new Set();

  galleryHtml.childNodes.forEach((element) => {
    set.add(element.dataset.category); //ajout de la catergorie au set eviter les doublons
  });
  console.log(set);
  //Création d'un bouton et d'un listener pour chaque category
  set.forEach((category) => {
    const button = document.createElement("button");
    button.textContent = category;

    button_container.appendChild(button);

    //Affiche toutes les figure qui on la bonne category et masque les autres
    button.addEventListener("click", () => {
      document.querySelectorAll("#gallery figure").forEach((fig) => {
        if (fig.dataset.category === category) {
          fig.classList.remove("hidden");
        } else {
          fig.classList.add("hidden");
        }
      });

      desactivateButton(button);
    });
  });

  //Ajout du listener pour le bouton "Tous"
  document.getElementById("button-all").addEventListener("click", (e) => {
    document.querySelectorAll("figure").forEach((fig) => {
      fig.classList.remove("hidden");
    });

    desactivateButton(e.target);
  });
}

//désactive le bouton activé
function desactivateButton(button) {
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

//Quand on click sur logout le token est supprimer du storage
// et la page est rechargée
//i le bouton est login il est redirigé vers la page de log
function handleLoginLogout() {
  const loginLink = document.getElementById("login-text");

  //si pas logé alors on va à la page de log
  if (loginLink.textContent === "Login") {
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
async function checkMode() {
  await retrieveWorks();
  retrieveCategory();

  //Récupération de la banniére édition
  const editionBanner = document.querySelector(".edition-mode");

  //Récupération du texte "login"
  const loginLink = document.getElementById("login-text");

  const button_container = document.querySelector(".button_container");
  const container_button_modif = document.querySelector(
    ".container-button-modif",
  );

  //si il y a le token alors on active le mode edition, affichage de la banniére
  //MODE EDITION
  if (sessionStorage.getItem("token")) {
    editionBanner.classList.remove("hidden"); //afficher la banniére edition

    loginLink.textContent = "Logout"; //le bouton login deviens logout

    button_container.classList.add("hidden");

    //MODE VISITEUR
  } else {
    editionBanner.classList.add("hidden"); //afficher la banniére edition

    loginLink.textContent = "Login"; //le bouton login deviens logout

    button_container.classList.remove("hidden");
    container_button_modif.classList.add("hidden");
  }
}

//Ouverture de la modale
function viewModalGallery() {
  //Affichage de la modale
  document.querySelector("dialog").showModal();

  //Affichage de la modale gallerie et masquage de la modalle ajouter
  modalGallery.classList.remove("hidden");
  modalAdd.classList.add("hidden");
  document.getElementById("retour").classList.add("hidden");
  document.getElementById("modale-titre").textContent = "Galerie photo";

  //Récupération du container pour les appérçu
  const container_works = document.querySelector(".work_model_container");

  container_works.innerHTML = ""; //On vide le container pour ne pas avoir de doublon

  //Pour chaque figure de la gallerie on créer une miniature
  allWorks.forEach((work) => {
    container_works.appendChild(createFigure(work, { forModal: true }));
  });
}

//Fermeture de la modale
function closeModal() {
  document.querySelector("dialog").close();
}
//Affichage de la modale d'ajout et masquage de la modale gallerie
function viewModalAdd() {
  modalGallery.classList.add("hidden");
  modalAdd.classList.remove("hidden");
  document.getElementById("retour").classList.remove("hidden");
  document.getElementById("modale-titre").textContent = "Ajout photo";

  //Récupération des catégories pour le select du formulaire
  addCategoriesForm();

  //Remise à zéro du formulaire d'ajout
  document.querySelector(".fa-image").classList.remove("hidden");
  document.querySelector(".btn-upload").classList.remove("hidden");
  document.querySelector(".upload-info").classList.remove("hidden");
  document.getElementById("preview-image").classList.add("hidden");
}


//Fonction pour ajouter un travail à la gallerie
async function addWorkToGallery(e) {
  e.preventDefault();

  //Création d'un objet FormData pour envoyer les données du formulaire
  const formData = new FormData();

  const inputPhoto = document.getElementById("input-photo").files[0];
  const titleInput = document.getElementById("title").value;
  const categoryInput = document.getElementById("category").value;

  //Ajout des données du formulaire à l'objet FormData
  formData.append("image", inputPhoto);
  formData.append("title", titleInput);
  formData.append("category", categoryInput);

  //Vérification si un fichier a été sélectionné
  if (!inputPhoto) {
    allert("Aucun fichier sélectionné !");
    console.error("Aucun fichier sélectionné !");
    return;
  }

  const response = await fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const texteErreur = await response.text();
    console.error("Détail de l'erreur :", texteErreur);
  }

  console.log(
    `| Envois de l'image          |
     | Satut : ${response.status}  |
     | response : ${response.text}  |  
  `,
  );

  await retrieveWorks();
  viewModalGallery(); //Retour à la modale gallerie
}

//Ecouteur d'événement pour vérifier si le formulaire est rempli
function LisenPageLoad() {
  const inputPhoto = document.getElementById("input-photo");
  const titre = document.getElementById("title");
  const category = document.getElementById("category");
  const submitButton = document.querySelector(".btn_valider");

  function verifForm() {
    if (
      inputPhoto.files.length > 0 &&
      titre.value.trim() !== "" &&
      category.value !== ""
    ) {
      submitButton.disabled = false;
    } else {
      submitButton.disabled = true;
    }
  }

  // Ajout des écouteurs d'événements pour vérifier le formulaire à chaque changement
  inputPhoto.addEventListener("change", verifForm);
  titre.addEventListener("input", verifForm);
  category.addEventListener("change", verifForm);
}

//Fonction pour supprimer un travail de la gallerie
async function deleteWork(id) {
  const response = await fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    const texteErreur = await response.text();
    console.error("Détail de l'erreur :", texteErreur);
  }

  console.log(
    `| Envois de l'image          |
     | Satut : ${response.status}  |
     | response : ${response.text}  |  
  `,
  );

  retrieveWorks();
}

//Fonction pour ajouter les catégories dans le select du formulaire d'ajout
async function addCategoriesForm() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des catégories");
    }

    formSelect.innerHTML = ""; // Vide le select avant de le remplir avec les nouvelles données
    const categories = await response.json();

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      formSelect.appendChild(option);
    });
  } catch (erreur) {
    console.error(erreur);
  }
}

//Fonction pour prévisualiser l'image sélectionnée dans le formulaire d'ajout
function previewModalImg(event) {
  //Récupération du fichier sélectionné
  const file = event.target.files[0];

  //si le fichier existe
  if (file) {
    //on verifi si le type de fichier reçu est dans notre liste
    if (ALLOWED_FILE_TYPE.indexOf(file.type) === -1) {
      alert("Type de fichier incorect, type accépté .jpeg .png");
      return;
    }

    if (file.size > MAX_SIZE) {
      alert("Taille de fichier incorecte, Max 4 Mo");
      return;
    }

    //Aprés vérification on continue

    document.querySelector(".fa-image").classList.add("hidden");
    document.querySelector(".btn-upload").classList.add("hidden");
    document.querySelector(".upload-info").classList.add("hidden");

    const previewImage = document.getElementById("preview-image");
    previewImage.classList.remove("hidden");

    const reader = new FileReader(); //création d'un lecteur pour l'image

    reader.onload = () => {
      previewImage.src = reader.result; //on met l'url du reader dans l'image

      // Nettoyage des écouteurs d'événements pour éviter les fuites de mémoire
      reader.onload = null;
      reader.onerror = null;
    };

    reader.onerror = () => {
      alert("Erreur lors du chargement de l'image. Veuillez rééssayer.");
      // Nettoyage des écouteurs d'événements pour éviter les fuites de mémoire
      reader.onload = null;
      reader.onerror = null;
    };

    reader.readAsDataURL(file); //on charge l'image dans le reader
  }
}

//Renvoi une figure semon le travail, suivant les option on peut rajouter
// la pubelle pour la modale ou renvoyer avec le figcaption pour la gallery
// voi d'autre option pour la suite
function createFigure(work, { forModal = false } = {}) {
  //Création des éléments global
  const workImg = document.createElement("img");

  workImg.src = work.imageUrl;

  //figure qui contient le travail
  const figure = document.createElement("figure");

  figure.dataset.category = work.category.name; //ajout d'un dataset pour la category pour le filtre
  figure.dataset.id = work.id; //Récupération de l'id du travail

  //Ajout de l'limage à la figure
  figure.appendChild(workImg);

  //pour la modale
  if (forModal) {
    //ajout du bouton poubelle
    figure.insertAdjacentHTML(
      "afterbegin",
      `
    <div class="trash-can-icon">
      <i class="fa-solid fa-trash-can"></i>
    </div>
  `,
    );

    //Ajout d'un listener sur l'icone poubelle pour supprimer
    //  la figure du modal et de l'API
    figure.querySelector(".trash-can-icon").addEventListener("click", (e) => {
      e.preventDefault();
      figure.remove(); // supprime la figure du modal
      const id = figure.dataset.id;
      deleteWork(id);
    });
  }
  //pour la gallerie
  else {
    //Réupération du titre
    const workTitle = document.createElement("figcaption");
    workTitle.textContent = work.title;
    figure.appendChild(workTitle);
  }

  return figure;
}

//************************Code lancer au démmarrage***********************

//Ajout de l'écoute quand la page est chargées afin de vérifier si le mode
// edition est activé en fonction du token du session storage
document.addEventListener("DOMContentLoaded", checkMode);

//Ajout de l'écoute sur le texte de log, qui prend deux valeur login ou logout
document.getElementById("login-text").addEventListener("click", handleLoginLogout);

//Bouton fermer de la modale
document.querySelector("#fermer").addEventListener("click", closeModal);

//Ajout de l'écoute du bouton modifier en mode edition pour ouvrir la modale
document
  .querySelector(".container-button-modif")
  .addEventListener("click", viewModalGallery);

//Ajout de l'écoute du bouton ajouter pour ouvrir la modale d'ajout d'image
document.querySelector(".btn_ajouter").addEventListener("click", viewModalAdd);

//Ajout de l'écoute du bouton retour pour revenir à la modale gallerie
document.getElementById("retour").addEventListener("click", viewModalGallery);

//Ajout de l'écoute du formulaire d'ajout d'image pour envoyer les données à l'API
document
  .getElementById("form-ajout-photo")
  .addEventListener("submit", addWorkToGallery);

//Ajout de l'écoute pour charger l'apérçu de l'image de nouveau projet
document
  .getElementById("input-photo")
  .addEventListener("change", previewModalImg);

LisenPageLoad();
