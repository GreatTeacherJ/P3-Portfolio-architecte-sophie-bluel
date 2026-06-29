console.log("Démarage du script");

worksRecovery();

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

    console.log(
      "nombre de objets = ",
      document.querySelectorAll("[data-category='Objets']").length,
    );
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
      document.querySelectorAll("figure").forEach((fig) => {
        if (fig.dataset.category === category) {
          fig.classList.remove("hidden");
        } else {
          fig.classList.add("hidden");
        }
      });

      desactivated_button(button);
    });
  });

  //Ajout du listener pour le bouton tous
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
