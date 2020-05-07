'use strict';

const cartButton = document.querySelector('#cart-button'),
  modal = document.querySelector('.modal'),
  close = document.querySelector('.close'),
  buttonAuth = document.querySelector('.button-auth'),
  modalAuth = document.querySelector('.modal-auth'),
  closeAuth = document.querySelector('.close-auth'),
  logInForm = document.querySelector('#logInForm'),
  loginInput = document.querySelector('#login'),
  userName = document.querySelector('.user-name'),
  buttonOut = document.querySelector('.button-out'),
  cardsRestaurants = document.querySelector('.cards-restaurants'),
  containerPromo = document.querySelector('.container-promo'),
  restaurants = document.querySelector('.restaurants'),
  menu = document.querySelector('.menu'),
  logo = document.querySelector('.logo'),
  cardsMenu = document.querySelector('.cards-menu');

let login = localStorage.getItem('gloDelivery');

/**
 * @param url
 * @returns {Promise<void>}
 * Получаем данные json из папки db
 */
const getData = async (url) => {
  //получаем данные
  const response = await fetch(url);
  //если статус 200 (без ошибки получения данных)
  if (!response.ok) {
    //создаём ошибку
    throw new Error(`Ошибка по адрресу ${url}, статус ошибки ${response.status}!`);
  }
  return await response.json();
};


//функиця валидации login
const valid = function (str) {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return nameReg.test(str);
};

function toggleModal() {
  modal.classList.toggle('is-open');
}

/**
 * метод открывает-закрывает окно авторизации
 */
const toggleModalAuth = () => {
  loginInput.style.borderColor = "";
  modalAuth.classList.toggle('is-open');
};

/**
 * метод показывает логин и кнопку "Выход"
 */

const authorized = () => {

  const logOut = () => {
    login = null;
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    localStorage.removeItem('gloDelivery');
    checkAuth();
  };
  //добавляем логин и кнопку "Выйти"
  userName.textContent = login;
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'block';
  //обработчик на кнопку "Выйти"
  buttonOut.addEventListener('click', logOut);
};

/**
 * метод показывает модальное окно авторизации
 */
const notAuthorized = () => {

  const logIn = (event) => {
    //отменяем действие по-умолчанию для submit
    event.preventDefault();
    //получаем значение логина без пробелов с начала и конца
    const userName = loginInput.value.trim();

    if (userName && valid(loginInput.value)) {

      //возвращаем значение по-умолчанию
      loginInput.style.borderColor = "";
      //добавляем значение логина в локальное хранилище и обновляем глобальную перременную логина
      localStorage.setItem('gloDelivery', userName);
      login = userName;
      //закрываем форму
      toggleModalAuth();
      //удаляем обработчики с закрытой формы
      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
      logInForm.reset();
      //вызываем проверку авторизации
      checkAuth();
    } else {
      //пользователь не ввел логин, подсвечиваем поле и добавляем placeholder
      loginInput.style.borderColor = "red";
      loginInput.placeholder = "Введите логин";
    }

  };
  //обрабочики на кнопки "😊 Войти" (действие описано выше), "Войти", х,
  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
};

/**
 * метод проверки авторизации
 */
const checkAuth = () => {
  login ? authorized() : notAuthorized();
};

/**
 * @returns {{tag: string, cls: string[], content: *[]}}
 * Объект-шаблон вёрстки карточки ресторана для browserJSEngine
 */

const cardRestaurantJSTemplate = (restaurant) => {
    const {name, image, kitchen, price, products, stars, time_of_delivery: timeOfDelivery} = restaurant;
    return {
      tag: 'a',
      cls: ['card', 'card-restaurant'],
      attrs: {
        "data-products": products,
        "data-name": name,
        "data-stars": stars,
        "data-price": price,
        "data-kitchen": kitchen,
      },
      content:
        [
          {
            tag: 'img',
            cls: 'card-image',
            attrs: {alt: 'image', src: image}
          },
          {
            tag: 'div',
            cls: 'card-text',
            content: [
              {
                tag: 'div',
                cls: 'card-heading',
                content: [
                  {tag: 'h3', cls: 'card-title', content: name},
                  {tag: 'span', cls: ['card-tag', 'tag'], content: `${timeOfDelivery} мин`}
                ],
              },
              {
                tag: 'div',
                cls: 'card-info',
                content: [
                  {tag: 'div', cls: 'rating', content: stars},
                  {tag: 'div', cls: 'price', content: `От ${price} ₽`},
                  {tag: 'div', cls: 'category', content: kitchen},
                ],
              }
            ]
          }
        ]
    }
  }
;

/**
 *
 * @param block - объект вёрстки
 * @returns {*} - HTML элемент
 * browserJSEngine - своеобразный движок, который рекурсивно обходит аргумент метода
 * Если значение ключа объекта - отсутсвует, то создаётся пустая текстовая нода (можно использовать фрагмент)
 * Если значение ключа объекта - строка, число, то создаём текстовую ноду со значением
 * Если значение ключа объекта - массив, то реккурсивно собираем элементы массива в фррагмент
 * Создаём элемент, нужного типа (по-умолчанию, div), добавляем классы, аттрибуты
 * Если значение ключа = content, то рекурсивно добавляем дочерние элементы контента в созданный элемент
 *
 * возвращает элемент
 */

const browserJSEngine = (block) => {

  if ((block === undefined) || (block === null) || (block === false))
    return document.createTextNode("");

  if ((typeof block === 'string') || (typeof block === 'number') || (block === true))
    return document.createTextNode(block.toString());

  if (Array.isArray(block)) {
    return block.reduce((f, el) => {
      f.appendChild(browserJSEngine(el));
      return f;
    }, document.createDocumentFragment());
  }

  const element = document.createElement(block.tag || 'div');
  element.classList.add(...[].concat(block.cls).filter(Boolean));

  if (block.attrs) {
    Object.keys(block.attrs).forEach(key => {
      element.setAttribute(key, block.attrs[key]);
    })
  }

  if (block.content) element.appendChild(browserJSEngine(block.content));
  return element;
};

/**
 * createCardRestaurantHTML - метод создания карточки ресторана
 *
 * Обращается к методу browserJSEngine - "движок создания вёрстки из объекта"
 * с аргументом cardRestaurantJSTemplate - объект вёрстки
 * */

const createCardRestaurant = (restaurant) => {
  cardsRestaurants.appendChild(browserJSEngine(cardRestaurantJSTemplate(restaurant)))
};

/**
 * createCardRestaurantHTML - метод создания карточки ресторана
 *
 * вариант создания вёрстки в js:
 * 1. копируем вёрстку в "шаблонную" строку с помощью обратных кавычек
 * 2. с помощью метода insertAdjacentHTML вставляем в HTML фрагмент в DOM
 * (метод разбирает указанный текст как HTML и вставляет полученные узлы (nodes) в DOM дерево в указанную позицию).
 *
 * Note: у метода insertAdjacentHTML два аргумента:
 * * первый аргумент принимает значения: 'beforebegin'|'afterbegin'|'beforeend'|'afterend'
 *   определяет позицию добавляемого элемента относительно элемента, вызвавшего метод
 * * второй аргумент - строка HTML
 */
const createCardRestaurantHTML = (restaurant) => {
  const {name, image, kitchen, price, products, stars, time_of_delivery: timeOfDelivery} = restaurant;
  const card = `
    <a class="card card-restaurant" data-products="${products}" 
    data-name = "${name}" 
    data-stars = "${stars}" 
    data-price="${price}" 
    data-kitchen="${kitchen}">
			<img src="${image}" alt="image" class="card-image"/>
			<div class="card-text">
				<div class="card-heading">
				  <h3 class="card-title">${name}</h3>
				  <span class="card-tag tag">${timeOfDelivery} мин</span>
			  </div>
				<div class="card-info">
				  <div class="rating">${stars}</div>
				  <div class="price">От ${price} ₽</div>
				  <div class="category">${kitchen}</div>
			  </div>
		  </div>
		</a>
  `;

  cardsRestaurants.insertAdjacentHTML('beforeend', card);
};


const createHeaderGoogs = (name, stars, price, kitchen) => {
  const restaurantTitle = document.querySelector('.restaurant-title');
  restaurantTitle.textContent = name;
  const restaurantRating = document.querySelector('.section-heading .rating');
  restaurantRating.textContent = stars;
  const restaurantPrice = document.querySelector('.section-heading .price');
  restaurantPrice.textContent = `От ${price} ₽`;
  const restaurantKitchen = document.querySelector('.section-heading .category');
  restaurantKitchen.textContent = kitchen;

};

/**
 * createCardGood - метод создания карточки товара
 *
 * вариант вёрстки:
 * 1. создаём родителькую ноду
 * 2. добавляем классы, аттрибуты
 * 3. добавляем шаблонной строкой вёрстку с помощью метода innerHTML
 * 4. добавляем родительскую ноду в DOM с помощью метода insertAdjacentElement
 */

const createCardGood = (good) => {
  const {description, id, image, name, price} = good;
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
						<img src="${image}" alt="image" class="card-image" data-id="${id}"/>
						<div class="card-text">
							<div class="card-heading">
								<h3 class="card-title card-title-reg">${name}</h3>
							</div>
							<div class="card-info">
								<div class="ingredients">${description}</div>
							</div>
							<div class="card-buttons">
								<button class="button button-primary button-add-cart">
									<span class="button-card-text">В корзину</span>
									<span class="button-cart-svg"></span>
								</button>
								<strong class="card-price-bold">${price} ₽</strong>
							</div>
						</div>
`;
  cardsMenu.insertAdjacentElement('beforeend', card);
};

/**
 * createCardGood - метод создания карточки товара
 *
 * вариант вёрстки js:
 * 1. Создаём ноду
 * 2. Добавляем классы, атрибуты, контент
 * 3. Если необходимо, то создаем дочерние элементы (шаги 1. и 2.)
 * 4. Добавляем в родительский (или начальный) HTML элемент
 */

const createCardGoodJS = (good) => {
  const card = document.createElement('div');
  card.className = 'card';

  const image = document.createElement('img');
  image.className = 'card-image';
  image.setAttribute('alt', 'image');
  image.setAttribute('src', good.image);
  card.appendChild(image);

  const cardText = document.createElement('div');
  cardText.className = 'card-text';
  const cardHeading = document.createElement('div');
  cardHeading.className = 'card-heading';
  const cardTitle = document.createElement('h3');
  cardTitle.className = 'card-title card-title-reg';
  cardTitle.textContent = good.name;
  cardHeading.appendChild(cardTitle);
  cardText.appendChild(cardHeading);

  const cardInfo = document.createElement('div');
  cardInfo.className = 'card-info';
  const ingredients = document.createElement('div');
  ingredients.className = 'ingredients';
  ingredients.textContent = good.description;
  cardInfo.appendChild(ingredients);
  cardText.appendChild(cardInfo);

  const cardButtons = document.createElement('div');
  cardButtons.className = 'card-buttons';
  const button = document.createElement('button');
  button.className = 'button button-primary button-add-cart';
  const buttonCardText = document.createElement('span');
  buttonCardText.className = 'button-card-text';
  buttonCardText.textContent = 'В корзину';
  const buttonCartSvg = document.createElement('span');
  buttonCartSvg.className = 'button-cart-svg';
  button.appendChild(buttonCardText);
  button.appendChild(buttonCartSvg);
  cardButtons.appendChild(button);

  const cardPriceBold = document.createElement('strong');
  cardPriceBold.className = 'card-price-bold';
  cardPriceBold.textContent = `${good.price} ₽`;

  cardButtons.appendChild(button);
  cardButtons.appendChild(cardPriceBold);
  cardText.appendChild(cardButtons);
  card.appendChild(cardText);
  cardsMenu.appendChild(card);

};

/**
 * @param event
 * Метод - при клике на карточку ресторана - открывает список товаров
 */

const openGoods = (event) => {
  //если логин не выбран, то показываем модальное окно с авторизацией
  if (!login) {
    toggleModalAuth();
    return;
  }
  const restaurant = event.target.closest('.card-restaurant');
  //изменяем внешнее оформление для отображения карточек товаров
  if (restaurant) {

    containerPromo.classList.add('hide');
    restaurants.classList.add('hide');
    menu.classList.remove('hide');
    cardsMenu.textContent = "";

    getData(`./db/${restaurant.dataset.products}`).then((data) => {
      createHeaderGoogs(restaurant.dataset.name, restaurant.dataset.stars, restaurant.dataset.price, restaurant.dataset.kitchen);
      data.map(dataElem => {
        //создаём карточку товара с помощью HTML
        createCardGood(dataElem);
        //создаём карточку товара с помощью JS
        //createCardGoodJS(dataElem, restaurant.dataset.restaurant);
      })
    });
  }
};

/**
 * метод для изменения внешнего оформления страницы при клике на logo
 * (начальное положение - выбор ресторанов)
 */
const goToHome = () => {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');
};


//обработчик клика на кнопку "Войти" или "Выйти"
cartButton.addEventListener('click', toggleModal);
//обработчик клика на крестик в модальном окне авторизации
close.addEventListener('click', toggleModal);
//обработчик клика на карточку ресторана
cardsRestaurants.addEventListener('click', openGoods);
//обработчик клика на logo (возврат на страницу выбора ресторана)
logo.addEventListener('click', goToHome);

//вызываем функцию проверки авторизации
checkAuth();

function init() {
  getData('./db/partners.json').then((data) => {
    data.map(dataElem => {
      //cоздаём карточку ресторана с помощью шаблонной строки HTML
      createCardRestaurantHTML(dataElem);
      //создаём каррточку ресторана с помощью объекта-вёрстки и "движка"
      //createCardRestaurant(dataElem);
    })
  });
}

init();

//Используем библиотеку Swiper
new Swiper('.swiper-container', {
  //чтобы был бесконечный
  loop: true,
  //автоматическое проигрывание
  autoplay: {
    delay: 3000,
  },
  slidePerView: 1,
  sliderPerColumn: 1,
});