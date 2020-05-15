const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://appUser:12345@freecluster-5stce.mongodb.net/TodoList?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
);

// plain object-type schema for items
const itemSchema = {
  text: String,
};
// model will create items (plural) collection
const Item = mongoose.model("item", itemSchema);
// create items using model based on schema
const item1 = new Item({ text: "Welcome to your to your list!" });
const item2 = new Item({ text: "+ button to add an item" });
const item3 = new Item({ text: "<-- check this to delete item" });
const defaultItems = [item1, item2, item3];

// plain object-type schema for lists
const listSchema = {
  name: String,
  items: [itemSchema],
};
const List = mongoose.model("list", listSchema);

// Routes
app.get("/", function (req, res) {
  // find all items (no condition {})
  Item.find({}, function (err, foundItems) {
    // no items saved in db
    if (!foundItems.length) {
      Item.insertMany(defaultItems, function (err, inserted) {
        if (!err) console.log(inserted);
      });
      // redirect to actually render default items
      res.redirect("/");
    }
    // render items from db
    res.render("list", { listTitle: "Today", newListItems: foundItems });
  });
});

app.post("/", function (req, res) {
  const newItem = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({ text: newItem });
  // main page
  if (listName === "Today") {
    item.save();
    res.redirect("/");
    // custom list
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.get("/:customList", function (req, res) {
  const customListName = _.capitalize(req.params.customList);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // create new custom list
        const customList = new List({
          name: customListName,
          items: defaultItems,
        });
        customList.save();
        res.redirect("/" + customListName);
      } else {
        // show existing custom list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) console.log("Item removed");
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }, // mongodb $pull method
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000);
