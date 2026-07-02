export const manifest = {
  screens: {
    scr_bv0660: { name: "Úvod", route: "/", position: { x: 160, y: 220 } },
    scr_on4039: {
      name: "O službách",
      route: "/o-sluzbach",
      position: { x: 1560, y: 220 },
    },
    scr_j8vpha: {
      name: "Ceník",
      route: "/cenik",
      position: { x: 2960, y: 220 },
    },
    scr_h0fkse: {
      name: "Kontakt",
      route: "/kontakt",
      position: { x: 4360, y: 220 },
    },
    scr_kxmg1q: {
      name: "Admin",
      route: "/northwind",
      position: { x: 160, y: 2200 },
    },
  },
  sections: {
    sec_nkbhfe: {
      name: "Website Navigation",
      x: 0,
      y: 0,
      width: 5720,
      height: 1180,
    },
    sec_43ma8b: {
      name: "Admin Area",
      x: 0,
      y: 1980,
      width: 1520,
      height: 1180,
    },
  },
  layers: [
    {
      kind: "section",
      id: "sec_nkbhfe",
      children: [
        { kind: "screen", id: "scr_bv0660" },
        { kind: "screen", id: "scr_on4039" },
        { kind: "screen", id: "scr_j8vpha" },
        { kind: "screen", id: "scr_h0fkse" },
      ],
    },
    {
      kind: "section",
      id: "sec_43ma8b",
      children: [{ kind: "screen", id: "scr_kxmg1q" }],
    },
  ],
};
