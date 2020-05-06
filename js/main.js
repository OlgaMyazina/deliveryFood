'use strict';

const cartButton = document.querySelector('#cart-button');
const modal = document.querySelector('.modal');
const close = document.querySelector('.close');
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');

let login = localStorage.getItem('gloDelivery');

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
  console.log('авторизован');

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
  console.log('не авторизован');

  const logIn = (event) => {
    //отменяем действие по-умолчанию для submit
    event.preventDefault();
    //получаем значение логина без пробелов с начала и конца
    const userName = loginInput.value.trim();
    if (userName) {
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

const cardRestaurantJSTemplate = () => {
  return {
    tag: 'a',
    cls: ['card', 'card-restaurant'],
    content: [
      {
        tag: 'img',
        cls: 'card-image',
        attrs: {
          alt: 'image',
          src: 'img/pizza-burger/preview.jpg',
        }
      },
      {
        tag: 'div',
        cls: 'card-text',
        content: [
          {
            tag: 'div',
            cls: 'card-heading',
            content: [
              {
                tag: 'h3',
                cls: 'card-title',
                content: 'PizzaBurger',
              },
              {
                tag: 'span',
                cls: ['card-tag', 'tag'],
                content: '45 мин',
              }
            ],
          },
          {
            tag: 'div',
            cls: 'card-info',
            content: [
              {
                tag: 'div',
                cls: 'rating',
                content: '4.5',
              },
              {
                tag: 'div',
                cls: 'price',
                content: 'От 700 ₽',
              },
              {
                tag: 'div',
                cls: 'category',
                content: 'Пицца',
              },
            ],
          }
        ]
      }
    ]
  }
};

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

const createCardRestaurant = () => {
  cardsRestaurants.appendChild(browserJSEngine(cardRestaurantJSTemplate()))
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
const createCardRestaurantHTML = () => {
  const card = `
    <a class="card card-restaurant">
			<img src="img/pizza-burger/preview.jpg" alt="image" class="card-image"/>
			<div class="card-text">
				<div class="card-heading">
				  <h3 class="card-title">PizzaBurger</h3>
				  <span class="card-tag tag">45 мин</span>
			  </div>
				<div class="card-info">
				  <div class="rating">4.5</div>
				  <div class="price">От 700 ₽</div>
				  <div class="category">Пицца</div>
			  </div>
		  </div>
		</a>
  `;

  cardsRestaurants.insertAdjacentHTML('beforeend', card);
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

const createCardGood = () => {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
						<img src="img/pizza-plus/pizza-vesuvius.jpg" alt="image" class="card-image"/>
						<div class="card-text">
							<div class="card-heading">
								<h3 class="card-title card-title-reg">Пицца Везувий</h3>
							</div>
							<div class="card-info">
								<div class="ingredients">Соус томатный, сыр «Моцарелла», ветчина, пепперони, перец
									«Халапенье», соус «Тобаско», томаты.
								</div>
							</div>
							<div class="card-buttons">
								<button class="button button-primary button-add-cart">
									<span class="button-card-text">В корзину</span>
									<span class="button-cart-svg"></span>
								</button>
								<strong class="card-price-bold">545 ₽</strong>
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

const createCardGoodJS = () => {
  const card = document.createElement('div');
  card.className = 'card';

  const image = document.createElement('img');
  image.className = 'card-image';
  image.setAttribute('alt', 'image');
  image.setAttribute('src', 'img/pizza-plus/pizza-vesuvius.jpg');
  card.appendChild(image);

  const cardText = document.createElement('div');
  cardText.className = 'card-text';
  const cardHeading = document.createElement('div');
  cardHeading.className = 'card-heading';
  const cardTitle = document.createElement('h3');
  cardTitle.className = 'card-title card-title-reg';
  cardTitle.textContent = 'Пицца Везувий';
  cardHeading.appendChild(cardTitle);
  cardText.appendChild(cardHeading);

  const cardInfo = document.createElement('div');
  cardInfo.className = 'card-info';
  const ingredients = document.createElement('div');
  ingredients.className = 'ingredients';
  ingredients.textContent = 'Соус томатный, сыр «Моцарелла», ветчина, пепперони, перец «Халапенье», соус «Тобаско», томаты.';
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
  cardPriceBold.textContent = '545 ₽';

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
    //создаём карточку товара с помощью HTML
    createCardGood();
    //создаём карточку товара с помощью JS
    createCardGoodJS()
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
//создаём каррточку ресторана с помощью объекта-вёрстки и "движка"
createCardRestaurant();
//cоздаём карточку ресторана с помощью шаблонной строки HTML
createCardRestaurantHTML();
