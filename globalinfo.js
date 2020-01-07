const connectionString = 'mongodb+srv://GaetanNOBRE:gFeF74p62nqLUFy3@nodejscluster-dvon1.azure.mongodb.net/JustePrix?retryWrites=true&w=majority'
let sessionIDs = []
const databaseProducts = [
  { _id: 1, name: 'Rafale M', price: 78000000 },
  { _id: 2, name: 'Titre de Lord de Sealand', price: 37 },
  { _id: 3, name: 'Vidéoprojecteur', price: 2500 },
  { _id: 4, name: 'Pelle 14 fonctions', price: 36 },
  { _id: 5, name: 'Scooter Bar', price: 885 },
  { _id: 6, name: 'Mentos - Boîte de 40 rouleaux - goût fruit', price: 24 },
  { _id: 7, name: 'SPA Gonflable Carré', price: 449 },
  { _id: 8, name: 'Une M2 à l\'Epita', price: 10168 },
  { _id: 9, name: 'Appareil à raclette traditionnel', price: 30 },
  { _id: 10, name: 'Citron caviar : 1kg', price: 160 },
  { _id: 11, name: 'Poupée Mannequin Disney : La Reine des neiges 2 - 27 cm', price: 12 },
  { _id: 12, name: 'Évier aquarium', price: 3820 },
  { _id: 13, name: 'Sandales poisson', price: 42 },
  { _id: 14, name: 'Enceinte multi-room Devialet Phantom sans fil', price: 1790 },
  { _id: 15, name: 'Le Jules Verne (Tour Eiffel) - Menu dégustation 5 plats dîner', price: 190 },
  { _id: 16, name: 'Mémoires de Jacques Chirac Tome 1 Broché', price: 22 },
  { _id: 17, name: 'Kit prêt à pousser pour cultiver des champignons - Pleurotes jaunes', price: 25 },
  { _id: 18, name: 'Champagne Bollinger R.D 2002 75cl', price: 189 },
  { _id: 19, name: 'Support de brosses à dent avec ventouse', price: 1 },
  { _id: 20, name: 'Saxophone Soprano courbé EAGLETONE ROAD CSS100', price: 429 }
]
module.exports = [connectionString, databaseProducts, sessionIDs]
