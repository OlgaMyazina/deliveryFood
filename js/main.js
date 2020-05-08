'use strict';

const cartButton = document.getElementById('cart-button'),
  modal = document.querySelector('.modal'),
  close = document.querySelector('.close'),
  buttonAuth = document.querySelector('.button-auth'),
  modalAuth = document.querySelector('.modal-auth'),
  closeAuth = document.querySelector('.close-auth'),
  logInForm = document.getElementById('logInForm'),
  loginInput = document.getElementById('login'),
  userName = document.querySelector('.user-name'),
  buttonOut = document.querySelector('.button-out'),
  cardsRestaurants = document.querySelector('.cards-restaurants'),
  containerPromo = document.querySelector('.container-promo'),
  restaurants = document.querySelector('.restaurants'),
  menu = document.querySelector('.menu'),
  logo = document.querySelector('.logo'),
  cardsMenu = document.querySelector('.cards-menu'),
  inputSearch = document.querySelector('.input-search'),
  restaurantTitle = document.querySelector('.restaurant-title'),
  restaurantRating = document.querySelector('.section-heading .rating'),
  restaurantPrice = document.querySelector('.section-heading .price'),
  restaurantKitchen = document.querySelector('.section-heading .category'),
  modalBody = document.querySelector('.modal-body'),
  modalPrice = document.querySelector('.modal-pricetag'),
  buttonClearCart = document.querySelector('.clear-cart');

let cart = JSON.parse(localStorage.getItem('cart'));
let login = localStorage.getItem('login');

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
  const nameReg = /^[a-zA-Zа-яёА-ЯЁ0-9.\s\-]{1,20}$/;
  return nameReg.test(str);
};

/**
 * метод открывает-закрывает модальное окно (передаём элемент-модальное окно, у которого меняем свойства видимости)
 */

const toggleModal = (htmlElement) => {
  htmlElement.classList.toggle('is-open');
};

const handlerToggleModalAuth = () => {
  toggleModal(modalAuth);
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
    cartButton.style.display = '';

    buttonOut.removeEventListener('click', logOut);
    localStorage.removeItem('login');
    checkAuth();
  };
  //добавляем логин и кнопку "Выйти"
  userName.textContent = login;
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';
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
      localStorage.setItem('login', userName);
      login = userName;
      //закрываем форму
      toggleModal(modalAuth);
      //удаляем обработчики с закрытой формы
      buttonAuth.removeEventListener('click', handlerToggleModalAuth);
      closeAuth.removeEventListener('click', handlerToggleModalAuth);
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
  buttonAuth.addEventListener('click', handlerToggleModalAuth);
  closeAuth.addEventListener('click', handlerToggleModalAuth);
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
      attrs: {"data-products": products},
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
  const card = browserJSEngine(cardRestaurantJSTemplate(restaurant));
  card.products = restaurant.products;
  card.info = [restaurant.name, restaurant.stars, restaurant.price, restaurant.kitchen];
  cardsRestaurants.appendChild(card);
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

  const card = document.createElement('a');
  card.classList.add('card');
  card.classList.add('card-restaurant');
  card.products = products;
  card.info = [name, stars, price, kitchen];

  card.insertAdjacentHTML('beforeend', `
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
  `);

  cardsRestaurants.insertAdjacentElement('beforeend', card);
};


const createHeaderGoods = (name, stars, price, kitchen) => {
  restaurantTitle.textContent = name;
  restaurantRating.textContent = stars;
  restaurantPrice.textContent = `От ${price} ₽`;
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
  card.classList.add('card');
  card.insertAdjacentHTML('beforeend', `
						<img src="${image}" alt="${name}" class="card-image" data-id="${id}"/>
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
								<strong class="card-price card-price-bold">${price} ₽</strong>
							</div>
						</div>
`);
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
  card.setAttribute('id', good.id);

  const image = document.createElement('img');
  image.className = 'card-image';
  image.setAttribute('alt', good.name);
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
  cardPriceBold.className = 'card-price';
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
    toggleModal(modalAuth);
    return;
  }
  const restaurant = event.target.closest('.card-restaurant');
  //изменяем внешнее оформление для отображения карточек товаров
  if (restaurant) {
    createHeaderGoods(...restaurant.info);

    //оформляем страницу каталога товаров
    goToCatalog();

    getData(`./db/${restaurant.products}`).then((data) => {
      data.map(dataElem => {
        //создаём карточку товара с помощью HTML
        //createCardGood(dataElem);
        //создаём карточку товара с помощью JS
        createCardGoodJS(dataElem, restaurant.dataset.restaurant);
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

/**
 * метод для изменения внешнего оформления каталога товаров при переходе из ресторана
 */

const goToCatalog = () => {
  containerPromo.classList.add('hide');
  restaurants.classList.add('hide');
  menu.classList.remove('hide');
  cardsMenu.textContent = "";
};

/**
 * @param event - событие нажатия клавиши в поле поиска
 *
 */
const handleSearch = (event) => {
  //получаем клавишу enter
  if (event.key !== 'Enter') {
    return;
  }
  //получаем поисковую строку, обрабатываем пробелы и регистр
  const value = event.target.value.toLowerCase().trim();

  if (!value) {
    event.target.style.borderColor = "tomato";
    setTimeout(function () {
      event.target.style.borderColor = "";
      event.target.value = "";
    }, 2000);
    return;
  }
  const goods = [];
  //получаем данные ресторанов
  getData('./db/partners.json')
    .then(data => {
      //из каждого рестоана нужно получить ссылки на каталог товаров
      const products = data.map(item => item.products);
      //перебираем каждую ссылку на каталог и получаем непосрредственно сам список товаров
      products.forEach(product => {
        //получаем список товаров
        getData(`./db/${product}`)
          .then(data => {
            //собираем все товары из всех ресторанов в один массив goods
            goods.push(...data);

            //оформляем страницу каталога товаров
            goToCatalog();
            createHeaderGoods("Результат поиска", "", "", "");

            //результат поиска передаём дальше
            return goods.filter(item =>
              item.name.toLowerCase().includes(value));

          })
          //дата - это результат поиска, для каждого найденного - создаём элемент
          .then(data =>
            data.forEach(elem => createCardGood(elem))
          )
      })
    });
  event.target.value = "";
};


/**
 * функция добавления товаров в корзину
 */
function addToCart(event) {
  const buttonAddToCart = event.target.closest('.button-add-cart');
  if (!buttonAddToCart) {
    return;
  }
  const card = event.target.closest('.card');
  const title = card.querySelector('.card-title-reg').textContent;
  const cost = card.querySelector('.card-price').textContent;
  const id = card.getAttribute('id');

  const food = cart.find(function (item) {
    return item.id === id;
  });

  if (food) {
    food.count++;
  } else {
    cart.push({id, title, cost, count: 1});
  }
  localStorage.setItem('cart', JSON.stringify(cart));
}

//создаём вёрстку элементо в корзине
const renderCart = () => {
  //очистили корзину
  modalBody.textContent = "";
  //для каждого элемента в корзине создаём вёрстку:
  cart.forEach(({id, title, cost, count}) => {
    const itemCard = `
        <div class="food-row">
					<span class="food-name">${title}</span>
					<strong class="food-price">${cost}</strong>
					<div class="food-counter">
						<button class="counter-button counter-minus " data-id="${id}">-</button>
						<span class="counter">${count}</span>
						<button class="counter-button counter-plus " data-id="${id}">+</button>
					</div>
				</div>
    `;
    //добавляем в DOM
    modalBody.insertAdjacentHTML('afterbegin', itemCard);
  });
  //суммируем
  const totalPrice = cart.reduce((sum, item) => {
    return sum + parseFloat(item.cost) * item.count;
  }, 0);
  modalPrice.textContent = `${totalPrice} P`;
};

const changeCount = (event) => {
  if (!event.target.classList.contains('counter-button')) {
    return;
  }
  const food = cart.find(function (item) {
    return item.id === event.target.dataset.id
  });

  if (event.target.classList.contains('counter-minus')) {
    food.count--;
    if (food.count === 0) {
      cart.splice(cart.indexOf(food), 1);
    }
  }
  if (event.target.classList.contains('counter-plus')) {
    food.count++;
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
};

function init() {
  if (!cart) {
    localStorage.setItem('cart', JSON.stringify([]));
    cart = [];
  }
  //обработчик клика на корзину
  cartButton.addEventListener('click', () => {
    renderCart();
    toggleModal(modal);
  });
  //обработчик клика на крестик в модальном окне авторизации
  close.addEventListener('click', toggleModal.bind(null, modal));
  //обработчик клика на карточку ресторана
  cardsRestaurants.addEventListener('click', openGoods);
  //обработчик клика на logo (возврат на страницу выбора ресторана)
  logo.addEventListener('click', goToHome);
  //обаботчик энтера в поиске
  inputSearch.addEventListener('keydown', handleSearch);
  //обработчик клика на кнопку "добавить в корзину"
  cardsMenu.addEventListener('click', addToCart);
  //обработчик клика изменения количество товаров по позиции в корзине
  modalBody.addEventListener('click', changeCount);
  //обработчик клика - кнопка отмена очистки корзины
  buttonClearCart.addEventListener('click', () => {
    cart.length = 0;
    localStorage.removeItem('cart');
    renderCart();
  });

  //вызываем функцию проверки авторизации
  checkAuth();

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