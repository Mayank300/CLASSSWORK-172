var table_number = null;

AFRAME.registerComponent("handleMarker", {
  init: async function () {
    if (table_number === null) {
      this.askTableNumber();
    }
    var dishes = await this.getDishes();
    this.el.addEventListener("markerFound", () => {
      if (table_number !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(dishes, markerId);
      }
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },

  getDishes: async function () {
    return await firebase
      .firestore()
      .collection("menu")
      .get()
      .then((data) => {
        return data.docs.map((doc) => {
          doc.data();
        });
      });
  },

  handleOrder: function (t_num, dish) {
    database
      .firestore()
      .collection("tables")
      .doc(t_num)
      .get()
      .then((doc) => {
        var details = doc.data();
        var parent = details["current_orders"][dish.id];
        if (parent) {
          parent["quantity"] += 1;
          var currentQuantity = parent["quantity"];
          details["current_orders"][dish.id]["subtotal"] =
            dish.price * currentQuantity;
        } else {
          parent = {
            item: dish.dish_name,
            price: dish.price,
            quantity: 1,
            subtotal: dish.price * 1,
          };
        }
        details.total_bill += dish.price;
        firebase.firestore().collection("tables").doc(doc.id).update(parent);
      });
  },

  askTableNumber: async function () {
    var iconUrl =
      "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title: "Welcome to Crown Plaza",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "Enter your table number",
          type: number,
          min: 1,
        },
      },
      closeOnClickOutside: false,
    }).then((value) => {
      table_number = value;
    });
  },

  handleMarkerFound: function (dishes, markerId) {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "flex";
    var ratingButton = document.getElementById("rating-button");
    var orderButton = document.getElementById("order-button");
    var orderSummary = document.getElementById("order-summary-button");
    var paymentButton = document.getElementById("pay-button");
    ratingButton.addEventListener("click", () => {
      swal({
        icon: "success",
        title: "Rate Dish",
        text: "Have a nice day",
      });
    });

    orderButton.addEventListener("click", () => {
      swal({
        icon: "success",
        title: "Thank you for ordering",
        text: "serving soon",
      });
    });

    orderSummary.addEventListener("click", () => {
      this.handleOrderSummary();
    });

    paymentButton.addEventListener("click", () => {
      this.handlePayment();
    });

    var dish = dishes.filter((dish) => {
      dish.id == markerId;
    })[0];

    var model = document.querySelector(`#model-${dish.id}`);
    model.setAttribute("position", dish.model_geometry.position);
    model.setAttribute("rotation", dish.model_geometry.rotation);
    model.setAttribute("scale", dish.model_geometry.scale);
  },

  handleMarkerLost: function () {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "null";
  },

  handleOrderSummary: async function () {
    var t_num;
    table_number <= 9
      ? (t_num = `T0${table_number}`)
      : (t_num = `T${table_number}`);
    var orderSummary = this.getOrderSummary(t_num);
    var modelDiv = document.getElementById("model-div");
    modelDiv.style.display = "flex";
    var billTableBody = document.getElementById("bill-tabel-body");
    billTableBody.innerHTML = "";
    var currentOrder = Object.keys(orderSummary.current_orders);
    currentOrder.map((i) => {
      var tr = document.createElement("tr");
      var item = document.createElement("td");
      var price = document.createElement("td");
      var quantity = document.createElement("td");
      var subTotal = document.createElement("td");
      item.innerHTML = orderSummary.current_orders[i].item;
      price.innerHTML = orderSummary.current_orders[i].price;
      quantity.innerHTML = orderSummary.current_orders[i].quantity;
      subTotal.innerHTML = orderSummary.current_orders[i].subTotal;
      price.setAttribute("class", "text-center");
      quantity.setAttribute("class", "text-center");
      subTotal.setAttribute("class", "text-center");
      tr.appendChild(item);
      tr.appendChild(price);
      tr.appendChild(quantity);
      tr.appendChild(subTotal);
      billTableBody.appendChild(tr);
    });
    var total_tr = document.createElement("tr");
    var td1 = document.createElement("td");
    td1.setAttribute("class", "no-line");
    var td2 = document.createElement("td");
    td2.setAttribute("class", "no-line");
    var td3 = document.createElement("td");
    td3.setAttribute("class", "no-line text-center");
    var total_tag = document.createElement("strong");
    total_tag.innerHTML = "TOTAL";
    td3.appendChild(total_tag);
    var td4 = document.createElement("td");
    td4.setAttribute("class", "no-line text-right");
    td4.innerHTML = "$" + orderSummary.total_bill;

    total_tr.appendChild(td1);
    total_tr.appendChild(td2);
    total_tr.appendChild(td3);
    total_tr.appendChild(td4);
    billTableBody.appendChild(total_tr);
  },

  getOrderSummary: async function (t_num) {
    return await firebase.firestore
      .collection("tables")
      .doc(t_num)
      .get()
      .then((doc) => {
        doc.data();
      });
  },

  handlePayments: function () {
    document.getElementById("model-div").style.display = "none";
    var t_num;
    table_number <= 9
      ? (t_num = `T0${table_number}`)
      : (t_num = `T${table_number}`);

    firebase
      .firestore()
      .collection("tables")
      .doc(t_num)
      .update({
        current_orders: {},
        total_bill: 0,
      })
      .then(() => {
        swal({
          icon: "success",
          title: "THANK YOU",
          text: "Hope to see you soon",
          timer: 3000,
          buttons: false,
        });
      });
  },
});
