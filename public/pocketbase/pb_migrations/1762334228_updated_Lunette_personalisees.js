/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1115776637")

  // remove field
  collection.fields.removeById("relation1007519717")

  // add field
  collection.fields.addAt(3, new Field({
    "convertURLs": false,
    "hidden": false,
    "id": "editor1041995051",
    "maxSize": 0,
    "name": "monture",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "convertURLs": false,
    "hidden": false,
    "id": "editor1651110324",
    "maxSize": 0,
    "name": "branche",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "convertURLs": false,
    "hidden": false,
    "id": "editor3421296606",
    "maxSize": 0,
    "name": "verre",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1115776637")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2716722970",
    "hidden": false,
    "id": "relation1007519717",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "couleur",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("editor1041995051")

  // remove field
  collection.fields.removeById("editor1651110324")

  // remove field
  collection.fields.removeById("editor3421296606")

  return app.save(collection)
})
