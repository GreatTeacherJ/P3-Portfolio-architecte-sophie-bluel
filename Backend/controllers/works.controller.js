const db = require('./../models');
const Works = db.works
const fs = require('fs');
const path = require('path');

exports.findAll = async (req, res) =>  {
	const works = await Works.findAll({include: 'category'});
	return res.status(200).json(works);
}

exports.create = async (req, res) => {
	const host = req.get('host');
	const title = req.body.title;
	const categoryId = req.body.category;
	const userId = req.auth.userId;
	const imageUrl = `${req.protocol}://${host}/images/${req.file.filename}`;
	try{
		const work = await Works.create({
			title,
			imageUrl,
			categoryId,
			userId
		})
		return res.status(201).json(work)
	}catch (err) {
		return res.status(500).json({ error: new Error('Something went wrong') })
	}
}

//Modification pour surrpimer le fichier image
exports.delete = async (req, res) => {
  try {
	//récupération du travail via l'id avec toutes les infos pour la supressiondu fichiers image
    const work = await Works.findByPk(req.params.id);

    if (!work) {
		//Nouvelle érreur créer 404 si le fichier demander n'est pas trouver
      	return res.status(404).json({ message: "Œuvre non trouvée" });
    }

    // Récupérer le nom du fichier depuis l'URL stockée
    const nomFichier = work.imageUrl.split("/images/")[1];
    const cheminFichier = path.join(__dirname, "..", "images", nomFichier);

    // Supprimer le fichier physique (si présent)
    fs.unlink(cheminFichier, (err) => {
      if (err) {
        console.error("Erreur suppression fichier :", err.message);
        // on ne bloque pas la suite même si le fichier n'existe plus
      }
    });

    // Supprimer l'entrée en base de données
    await work.destroy();

    return res.status(200).json({ message: "Work deleted successfully" });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
