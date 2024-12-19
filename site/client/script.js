ymaps.ready(init);

async function init() {
    const map = new ymaps.Map("map", {
        center: [55.751244, 37.618423],
        zoom: 10,
    });

    const areaSelect = document.getElementById("area");
    const statusSelect = document.getElementById("status");
    const debitInput = document.getElementById("debit");
    const searchButton = document.getElementById("search");
    const loginBtn = document.getElementById("login-btn");
    const loginModal = document.getElementById("login-modal");
    
    var isAdmin = false;

    // Загрузка данных для выбора областей и типов грунта
    const fetchData = async (endpoint) => {
        const response = await fetch(endpoint);
        return response.json();
    };

    const areas = await fetchData("/api/areas");
    const statuses = await fetchData("/api/statuses");
    const places = await fetchData("/api/places");

    areas[0].forEach(area => {
        const option = document.createElement("option");
        option.value = area.name;
        option.textContent = area.name;
        areaSelect.appendChild(option);
    });

    statuses[0].forEach(status => {
        const option = document.createElement("option");
        option.value = status.name;
        option.textContent = status.name;
        statusSelect.appendChild(option);
    });

    // Обработка поиска
    searchButton.addEventListener("click", async (e) => {
        e.preventDefault()
        const area = areaSelect.value;
        const status = statusSelect.value;
        const minDebit = debitInput.value;

        const wells = await fetchData(`/api/wells?area=${area}&status=${status}&debit=${minDebit}`);
        map.geoObjects.removeAll();
        wells[0].forEach(well => {
            console.log(well['Место'])
            const placemark = new ymaps.Placemark([well.x, well.y], {
                hintContent: `${well['Место']} (${well["Глубина"]}м)`,
                balloonContent: `Глубина: ${well["Глубина"]}м<br>Дебит: ${well["Дебит"]}`,
            });
            map.geoObjects.add(placemark);
        });
    });
    
    // Добавление прослушивания нажатия кнопки для открытия, закрытия модального окна и отправки данных для авторизации 
    loginBtn.addEventListener("click", (e) => loginModal.style.display = "block");
    document.getElementById("login-close").addEventListener("click", () => loginModal.style.display = "none");

    document.getElementById("login-submit").addEventListener("click", async (e) => {
        e.preventDefault()
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            isAdmin = true;
            loginModal.style.display = "none";
            createAdminForms();
        } else {
            alert("Неверный логин или пароль");
        }
    });
    // Функция для создания формы администратора
    function createAdminForms() {
        const main = document.querySelector("main");
        const adminForms = document.createElement("div");
        adminForms.id = "admin-forms";

        adminForms.innerHTML = `
            <form id="add-area-city-form">
                <h3>Добавить область и город</h3>
                <label for="new-area">Название области:</label>
                <input type="text" id="new-area">
                <br>
                <label for="new-city">Название города:</label>
                <input type="text" id="new-city">
                <br>
                <button type="button" id="add-area-city">Добавить</button>
            </form>
            <form id="add-well-form">
                <label>Координаты:</label>
                <input type="text" id="well-coord">
                <label>глубина в м:</label>
                <input type="text" id="well-depth">
                <label>скорость потока:</label>
                <input type="text" id="well-debit">
                <label>Тип грунта:</label>
                <select id = "well-statuses"></select>
                <label>Город:</label>
                <select id = "well-place"></select>
                <br>
                <button type="button" id="add-well">Добавить</button>
            </form>`;
            

        main.appendChild(adminForms);
        add_well_select = document.getElementById("well-statuses")
        statuses[0].forEach(status => {
            const option = document.createElement("option");
            option.value = status.name;
            option.textContent = status.name;
            add_well_select.appendChild(option);
        }); 
    
        add_well_select3 = document.getElementById("well-place")
        places[0].forEach(area => {
            const option = document.createElement("option");
            option.value = area.name;
            option.textContent = area.name;
            add_well_select3.appendChild(option);
        });
        // Добавление обработчика для формы
        adminForms.querySelector("#add-area-city").addEventListener("click", async (e) => {
            e.preventDefault()
            const areaName = document.getElementById("new-area").value;
            const cityName = document.getElementById("new-city").value;

            if (areaName && cityName) {
                await fetch("/api/addAreaCity", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ area: areaName, city: cityName }),
                });
                alert("Область добавлена");
            }
        });
        adminForms.querySelector("#add-well").addEventListener("click", async (e) => {
            e.preventDefault()  
            const well_coord = document.getElementById("well-coord").value;
            const well_depth = document.getElementById("well-depth").value;
            const well_debit = document.getElementById("well-debit").value;
            const well_status = document.getElementById("well-statuses").value;
            const well_place = document.getElementById("well-place").value;

            if (well_coord && well_debit && well_status && well_depth) {
                await fetch("/api/addWell", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ coord: well_coord, depth: well_depth, debit: well_debit, status: well_status,  place: well_place}),
                });
                alert("Область добавлена");
            }
        });
    }
    map.events.add('click', function (e) {
        if(isAdmin){
            const coords = e.get('coords'); // Получение координат клика
            const coordInput = document.getElementById('well-coord');
            coordInput.value = `${coords[0].toFixed(6)},${coords[1].toFixed(6)}`; // Запись координат в поле
        } 
    });
    
}