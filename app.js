const express = require("express");
const mongoose = require("mongoose");
const date = require("./date");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://appUser:12345@freecluster-5stce.mongodb.net/TodoList?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const itemSchema = {
  text: String,
};

const Item = mongoose.model("item", itemSchema);

const item1 = new Item({ text: "Welcome!" });
const item2 = new Item({ text: "+ to add item" });
const item3 = new Item({ text: "- to delete item" });

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  const day = date.getDate();

  Item.find({}, function (err, foundItems) {
    if (!foundItems.length) {
      Item.insertMany(defaultItems, function (err, docs) {
        if (err) {
          console.log(err.message);
        }
        console.log(docs);
      });
      res.redirect("/");
    }

    res.render("list", { listTitle: day, newListItems: foundItems });
  });
});

app.post("/", function (req, res) {
  const itemEntered = req.body.newItem;
  const item = new Item({ text: itemEntered });
  item.save();

  res.redirect("/");
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000);
