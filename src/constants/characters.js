const playersID = {
  Abbadon: "965254444",
  Tibius: "587760655",
  Fergus: "960580168",
  Rowan: "2",
  Mestre: "744974273",
  Cubo: "cube",
};

const CHARACTERS = [
  {
    id: playersID.Mestre,
    name: "Teste",
    level: 100,
    vocation: "Mestre",
    items: [
      { name: "Espada", weight: 50, quantity: 1, desc: "" },
      { name: "Escudo", weight: 70, quantity: 1, desc: "" },
      { name: "Capacete", weight: 30, quantity: 1, desc: "" },
    ],
  },
  {
    id: playersID.Tibius,
    name: "Tacio",
    level: 85,
    vocation: "Feiticeiro",
    items: [
      { name: "Varinha", weight: 25, quantity: 1, desc: "" },
      { name: "Túnica", weight: 15, quantity: 1, desc: "" },
      { name: "Amuleto", weight: 5, quantity: 1, desc: "" },
    ],
  },
  {
    id: playersID.Abbadon,
    name: "Abbadon",
    level: 100,
    vocation: "Guerreiro",
    items: [],
  },
  {
    id: playersID.Fergus,
    name: "Fergus",
    level: 100,
    vocation: "Guerreiro",
    items: [],
  },
  {
    id: playersID.Rowan,
    name: "Rowan",
    level: 100,
    vocation: "Guerreiro",
    items: [],
  },
  {
    id: playersID.Cubo,
    name: "Cubo",
    level: 100,
    vocation: "Guerreiro",
    items: [],
  },
];

module.exports = {
  playersID,
  CHARACTERS,
};
