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
    id: playersID.Mestre, // <<<<----- modelo oficial
    name: "Teste",
    level: 100,
    vocation: "Mestre",
    items: [
      { name: "Espada", weight: 50, quantity: 1, desc: "", equipped: true, pocket: "Mochila" },
      { name: "Escudo", weight: 70, quantity: 1, desc: "", equipped: true, pocket: "Mochila"  },
      { name: "Capacete", weight: 30, quantity: 1, desc: "", equipped: true, pocket: "Mochila"  },
    ],
    status: { 
      pvMax: 19, pfMax: 15, pmMax: 25, legMax: 4, pvAtual:9, pfAtual: 10, pmAtual:25, legAtual: 4, log: ["levou uma lapada","descansou", "até 5 logs"]
    },
    notifications: true,
    lastModified: "hora - data",
    pockets: [
      {name: "Corpo", equipped: "true"},
      {name: "Chão",  equipped: "false"}
    ],
    tradeON:[ // aqui estão os pedidos de troca ativos
      {
        from:"id1",
        date: "hora - dia",
        message: "alguma coisa",
        items:
          [
            { name: "Espada", weight: 50, quantity: 1, desc: ""},
            { name: "Escudo", weight: 70, quantity: 1, desc: ""},
            { name: "Capacete", weight: 30, quantity: 1, desc: ""},
          ],
      },
      {
        from: "id2",
        date: "hora - dia",
        message: "alguma coisa",
        items:
          [  
            { name: "Varinha", weight: 25, quantity: 1, desc: ""},
            { name: "Túnica", weight: 15, quantity: 1, desc: ""},
            { name: "Amuleto", weight: 5, quantity: 1, desc: ""},
          ], // até 5 possíveis troca na fila de uma mesma pessoa
      },
    ],
    tradeOFF: [ // aqui estão os pedido de troca inativos
        // segue igual o tradeON;
    ]

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
