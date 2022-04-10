AFRAME.registerComponent("create-markers", {
  init: async function () {
    var mainScene = document.querySelector("#main-scene");
    var dishes = this.getDishes();
    dishes.map((item) => {
      var marker = document.createElement("a-marker");
      marker.setAttribute("id", item.id);
      marker.setAttribute("type", "pattern");
      marker.setAttribute("url", item.marker_pattern_url);
      marker.setAttribute("cursor", {
        rayOrigin: "mouse",
      });
      marker.setAttribute("handleMarker", {});

      var todaysDate = new Date();
      var todaysDay = todaysDate.getDay();
      var days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];

      if (!item.unavailable_days.includes(days[todaysDay])) {
        var dishModel = document.createElement("a-entity");
        dishModel.setAttribute("id", `dishModel-${item.id}`);
        dishModel.setAttribute("position", item.model_geometry.position);
        dishModel.setAttribute("rotation", item.model_geometry.rotation);
        dishModel.setAttribute("scale", item.model_geometry.scale);
        dishModel.setAttribute("gltf-model", `url(${item.model_url})`);
        dishModel.setAttribute("gesture-handler", {});
        dishModel.setAttribute("visible", false);

        // creating ingd container

        var ingdPlain = document.createElement("a-plain");
        ingdPlain.setAttribute("id", `ingdplain-${item.id}`);
        ingdPlain.setAttribute("position", {
          x: 0,
          y: 0,
          z: 0,
        });
        ingdPlain.setAttribute("rotation", {
          x: -90,
          y: 0,
          z: 0,
        });
        ingdPlain.setAttribute("width", 1.7);
        ingdPlain.setAttribute("height", 1.5);
        ingdPlain.setAttribute("visible", false);

        var titlePlain = document.createElement("a-plain");
        titlePlain.setAttribute("id", `titlePlain-${item.id}`);
        titlePlain.setAttribute("position", {
          x: 0,
          y: 0.9,
          z: 0.02,
        });
        titlePlain.setAttribute("rotation", {
          x: 0,
          y: 0,
          z: 0,
        });
        titlePlain.setAttribute("width", 1.7);
        titlePlain.setAttribute("height", 0.3);
        titlePlain.setAttribute("visible", false);
        titlePlain.setAttribute("material", {
          color: "black",
        });

        var dishTitle = document.createElement("a-entity");
        dishTitle.setAttribute("id", `dishTitle-${item.id}`);
        dishTitle.setAttribute("position", {
          x: 0,
          y: 0,
          z: 0.1,
        });
        dishTitle.setAttribute("rotation", {
          x: 0,
          y: 0,
          z: 0,
        });
        dishTitle.setAttribute("text", {
          font: "monoid",
          color: "white",
          width: 1.9,
          height: 1,
          align: "center",
          value: item.dish_name.toUpperCase(),
        });

        var ingd = document.createElement("a-entity");
        ingd.setAttribute("id", `ingd-${item.id}`);
        ingd.setAttribute("position", {
          x: 0.3,
          y: 0,
          z: 0.1,
        });
        ingd.setAttribute("rotation", {
          x: 0,
          y: 0,
          z: 0,
        });
        ingd.setAttribute("text", {
          font: "monoid",
          color: "white",
          width: 2,
          height: 1,
          align: "left",
          value: `${item.ingredients.join("\n\n")}`,
        });

        var pricePlain = document.createElement("a-image");
        pricePlain.setAttribute("id", `pricePlain-${item.id}`);
        pricePlain.setAttribute("position", {
          x: -1.3,
          y: 0,
          z: 0.3,
        });
        pricePlain.setAttribute("rotation", {
          x: 90,
          y: 0,
          z: 0,
        });
        pricePlain.setAttribute("visible", false);
        pricePlain.setAttribute("height", 0.8);
        pricePlain.setAttribute("width", 0.8);
        pricePlain.setAttribute(
          "src",
          "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/black-circle.png"
        );

        var price = document.createElement("a-entity");
        price.setAttribute("id", `price-${item.id}`);
        price.setAttribute("position", {
          x: 0.03,
          y: 0.05,
          z: 0.1,
        });
        price.setAttribute("rotation", {
          x: 0,
          y: 0,
          z: 0,
        });
        price.setAttributes("text", {
          font: "mozillavr",
          color: "white",
          align: "center",
          width: 3,
          value: `Only\n$${item.price}`,
        });

        pricePlain.appendChild(price);
        titlePlain.appendChild(dishTitle);
        ingdPlain.appendChild(titlePlain);
        ingdPlain.appendChild(ingd);
        marker.appendChild(ingdPlain);
        marker.appendChild(pricePlain);
        marker.appendChild(dishModel);
        mainScene.appendChild(marker);
      }
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
});
