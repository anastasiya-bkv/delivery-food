"use strict";

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector(".button-auth");
const modalAuth = document.querySelector(".modal-auth");
const closeAuth = document.querySelector(".close-auth");
const logInForm = document.querySelector("#logInForm");
const loginInput = document.querySelector("#login");
const userName = document.querySelector(".user-name");
const buttonOut = document.querySelector(".button-out");
const cardsRestaurants = document.querySelector(".cards-restaurants");
const containerPromo = document.querySelector(".container-promo");
const restaurants = document.querySelector(".restaurants");
const menu = document.querySelector(".menu");
const logo = document.querySelector(".logo");
const cardsMenu = document.querySelector(".cards-menu");
const inputSearch = document.querySelector(".input-search");
const modalBody = document.querySelector(".modal-cart .modal-body");
const modalPricetag = document.querySelector(".modal-pricetag");
const buttonClearCart = document.querySelector(".clear-cart");

let login = localStorage.getItem("gloDeliveryLogin");

const cart = [];

function loadCart() {
  if (localStorage.getItem(login)) {
    cart.length = 0;
    cart.push(...JSON.parse(localStorage.getItem(login)));
  }
}

function saveCart() {
  localStorage.setItem(login, JSON.stringify(cart));
}

const getData = async function (url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Ошибка по адресу ${url}, статус ошибка ${response.status}!`
    );
  }
  return await response.json();
};

const validLogin = function (str) {
  const reg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return reg.test(str.trim());
};

function toggleModalAuth() {
  modalAuth.classList.toggle("is-open");
}

function toggleModal() {
  modal.classList.toggle("is-open");
}

function returnMain() {
  containerPromo.classList.remove("hide");
  restaurants.classList.remove("hide");
  menu.classList.add("hide");
}

function autorized() {
  function logOut() {
    login = null;
    cart.length = 0;
    localStorage.removeItem("gloDeliveryLogin");
    buttonAuth.style.display = "";
    buttonOut.style.display = "";
    userName.style.display = "";
    cartButton.style.display = "";
    buttonOut.removeEventListener("click", logOut);
    checkAuth();
    returnMain();
  }
  userName.textContent = login;
  buttonAuth.style.display = "none";
  buttonOut.style.display = "flex";
  userName.style.display = "block";
  cartButton.style.display = "flex";
  buttonOut.addEventListener("click", logOut);
}

function notAutorized() {
  function logIn(event) {
    event.preventDefault();
    if (validLogin(loginInput.value)) {
      loginInput.style.border = "";
      login = loginInput.value;
      localStorage.setItem("gloDeliveryLogin", login);
      logInForm.reset();
      toggleModalAuth();
      buttonAuth.removeEventListener("click", toggleModalAuth);
      closeAuth.removeEventListener("click", toggleModalAuth);
      logInForm.removeEventListener("submit", logIn);
      checkAuth();
      loadCart();
    } else {
      loginInput.style.border = "1px solid red";
    }
  }
  buttonAuth.addEventListener("click", toggleModalAuth);
  closeAuth.addEventListener("click", toggleModalAuth);
  logInForm.addEventListener("submit", logIn);
}

const checkAuth = () => (login ? autorized() : notAutorized());

function createCardRestaurant({
  name,
  time_of_delivery: timeOfDelivery,
  stars,
  price,
  kitchen,
  image,
  products,
}) {
  const card = `
    <a class="card card-restaurant" data-products="${products}" 
    data-price="${price}" data-name="${name}" data-stars="${stars}"
    data-kitchen="${kitchen}">
    <img src="${image}" alt="image" class="card-image"/>
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title">${name}</h3>
        <span class="card-tag tag">${timeOfDelivery} мин</span>
      </div>
      <!-- /.card-heading -->
      <div class="card-info">
        <div class="rating">
          ${stars}
        </div>
        <div class="price">От ${price} ₽</div>
        <div class="category">${kitchen}</div>
      </div>
      <!-- /.card-info -->
    </div>
    <!-- /.card-text -->
    </a>`;
  cardsRestaurants.insertAdjacentHTML("beforeend", card);
}

function createCardGood({ id, name, description, price, image }) {
  const card = document.createElement("div");
  card.className = "card";
  //card.innerHTML
  card.insertAdjacentHTML(
    "beforeend",
    `
						<img src="${image}" alt="image" class="card-image"/>
						<div class="card-text">
							<div class="card-heading">
								<h3 class="card-title card-title-reg">${name}</h3>
							</div>
							<!-- /.card-heading -->
							<div class="card-info">
								<div class="ingredients">${description}
								</div>
							</div>
							<!-- /.card-info -->
							<div class="card-buttons">
								<button class="button button-primary button-add-cart" id="${id}">
									<span class="button-card-text">В корзину</span>
									<span class="button-cart-svg"></span>
								</button>
								<strong class="card-price card-price-bold">${price} ₽</strong>
							</div>
						</div>
						<!-- /.card-text -->
  `
  );
  cardsMenu.insertAdjacentElement("beforeend", card);
}

function createRestaurantHeading(restaurant) {
  const { name, stars, price, kitchen } = restaurant;
  const heading = document.createElement("div");
  heading.className = "section-heading";

  heading.insertAdjacentHTML(
    "afterbegin",
    `
    <h2 class="section-title restaurant-title">${name}</h2>
    <div class="card-info">
      ${stars ? `<div class="rating">${stars}</div>` : ""}
      ${price ? `<div class="price">${`От ${price} ₽`}</div>` : ""}
      ${kitchen !== "" ? `<div class="category">${kitchen}</div>` : ""}
    </div>
  `
  );
  menu.insertAdjacentElement("afterbegin", heading);
  window.scrollTo(0, 0);
}

function openGoods(event) {
  if (login) {
    const restaurant = event.target.closest(".card-restaurant");
    if (restaurant) {
      const menuSectionHeading = document.querySelector(
        ".menu .section-heading"
      );
      if (menuSectionHeading) {
        menu.removeChild(menuSectionHeading);
      }
      cardsMenu.textContent = "";
      containerPromo.classList.add("hide");
      restaurants.classList.add("hide");
      menu.classList.remove("hide");
      getData(`./db/${restaurant.dataset.products}`).then(function (data) {
        data.forEach(createCardGood);
        createRestaurantHeading(restaurant.dataset);
      });
    }
  } else {
    toggleModalAuth();
  }
}

function addToCart(event) {
  const buttonAddToCart = event.target.closest(".button-add-cart");
  if (buttonAddToCart) {
    const card = event.target.closest(".card");
    const title = card.querySelector(".card-title-reg").textContent;
    const cost = parseFloat(card.querySelector(".card-price").textContent);
    const id = buttonAddToCart.id;
    const food = cart.find(function (item) {
      return item.id === id;
    });
    if (food) {
      food.count += 1;
    } else {
      cart.push({ id, title, cost, count: 1 });
    }
    saveCart();
  }
}

function renderCart() {
  modalBody.textContent = "";
  cart.forEach(function ({ id, title, cost, count }) {
    const foodRow = `
    <div class="food-row">
      <span class="food-name">${title}</span>
      <strong class="food-price">${cost} ₽</strong>
      <div class="food-counter">
        <button class="counter-button counter-minus" data-id="${id}">-</button>
        <span class="counter">${count}</span>
        <button class="counter-button counter-plus" data-id="${id}">+</button>
      </div>
    </div>
  `;
    modalBody.insertAdjacentHTML("beforeend", foodRow);
  });
  const totalSum = cart.reduce(function (total, item) {
    return total + item.cost * item.count;
  }, 0);
  modalPricetag.textContent = totalSum + " ₽";
}

function changeCount(event) {
  if (event.target.classList.contains("counter-button")) {
    const food = cart.find(function (item) {
      return item.id === event.target.dataset.id;
    });
    if (event.target.classList.contains("counter-minus")) {
      food.count--;
      if (food.count === 0) {
        cart.splice(cart.indexOf(food), 1);
      }
    }
    if (event.target.classList.contains("counter-plus")) {
      food.count++;
    }
    saveCart();
    renderCart();
  }
}

function init() {
  getData("./db/partners.json").then(function (data) {
    data.forEach(createCardRestaurant);
  });

  cartButton.addEventListener("click", renderCart());
  cartButton.addEventListener("click", toggleModal());
  modalBody.addEventListener("click", changeCount);
  close.addEventListener("click", toggleModal);
  cardsRestaurants.addEventListener("click", openGoods);
  cardsMenu.addEventListener("click", addToCart);
  buttonClearCart.addEventListener("click", function () {
    cart.length = 0;
    saveCart();
    renderCart();
  });

  logo.addEventListener("click", function () {
    containerPromo.classList.remove("hide");
    restaurants.classList.remove("hide");
    menu.classList.add("hide");
  });

  inputSearch.addEventListener("keydown", function (event) {
    const value = event.target.value.toLowerCase().trim();

    if (event.keyCode !== 13) {
      return;
    }

    if (!login) {
      toggleModalAuth();
      return;
    }

    if (!value || value.length < 3) {
      event.target.style.border = "1px solid red";
      event.target.value = "";
      setTimeout(function () {
        event.target.style.border = "";
      }, 2000);
      return;
    }

    getData("./db/partners.json")
      .then(function (data) {
        const products = data.map(function (item) {
          return item.products;
        });
        return Promise.all(
          products.map(function (product) {
            return getData(`./db/${product}`);
          })
        );
      })
      .then((partnersProducts) => {
        const goods = partnersProducts.flat();
        const searchGoods = goods.filter(function (good) {
          return (
            good.name.toLowerCase().includes(value) ||
            good.description.toLowerCase().includes(value)
          );
        });
        cardsMenu.textContent = "";
        containerPromo.classList.add("hide");
        restaurants.classList.add("hide");
        menu.classList.remove("hide");
        event.target.value = "";
        const restaurant = {
          name: "Результаты поиска",
          stars: "",
          price: "",
          kitchen: "",
        };
        if (searchGoods.length < 1) {
          restaurant.name = "По вашему запросу ничего не найдено";
        } else {
          searchGoods.forEach(createCardGood);
        }
        const menuSectionHeading = document.querySelector(
          ".menu .section-heading"
        );

        if (menuSectionHeading) {
          menu.removeChild(menuSectionHeading);
        }
        createRestaurantHeading(restaurant);
      });
  });

  checkAuth();
  loadCart();

  new Swiper(".swiper-container", {
    loop: true,
    autoplay: {
      delay: 2000,
    },
    keyboard: {
      enabled: true,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}

init();
