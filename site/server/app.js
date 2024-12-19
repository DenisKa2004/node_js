const express = require("express");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("./client"));

// Получение списка областей
app.get("/api/areas", async (req, res) => {
    try {
        const areas = await db.query("SELECT name FROM area");
        res.json(areas);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Получение типов грунта
app.get("/api/statuses", async (req, res) => {
    try {
        const statuses = await db.query("SELECT name FROM status");
        res.json(statuses);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Получение городов
app.get("/api/places", async (req, res) => {
    try {
        const places = await db.query("SELECT name FROM place");
        res.json(places);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Поиск скважин
app.get("/api/wells", async (req, res) => {
    const { area, status, debit } = req.query;
    try {
        const wells = await db.query(
            "CALL GetWellByCriteria(?, ?, ?)",
            [area, parseInt(debit), status]
        );
        res.json(wells[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// Авторизация
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "admin") {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Неверные логин или пароль" });
    }
});
// Добавление области и города
app.post("/api/addAreaCity", async (req, res) => {
    const { area, city } = req.body;

try {
    let areaId;

    // Проверяем, существует ли область
    const result = await db.query("SELECT id FROM area WHERE name = ?", [area]);

    if (result[0].length > 0) {
        // Область существует, получаем её ID
        areaId=result[0][0].id

    } else {
        // Область отсутствует, создаём её
        await db.query("INSERT INTO area (name) VALUES (?)", [area]);
        const result = await db.query("SELECT id FROM area WHERE name = ?", [area]);
        areaId = result[0][0].id
    }

    // Проверяем, существует ли уже место с таким названием и в указанной области
    const result1 = await db.query(
        "SELECT id FROM place WHERE name = ? AND area = ?", 
        [city, areaId]
    );
    if (result1[0].length > 0) {
        // Если место уже существует
        return res.status(200).json({ message: "Место уже существует в указанной области" });
    }

    // Добавляем новое место
    await db.query(
        "INSERT INTO place (name, area) VALUES (?, ?)", 
        [city, areaId]
    );
    const result2= await db.query(
        "select id from place where name = ? and area = ?", 
        [city, areaId]
    );
    // Проверяем успешность добавления места
    if (result2[0].length > 0) {
        return res.status(201).json({ message: "Место успешно добавлено" });
    } else {
        return res.status(500).json({ message: "Ошибка при добавлении места" });
    }
} catch (error) {
    console.error("Ошибка сервера:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
}

});
// добавление скважены
app.post("/api/addWell", async (req, res) => {
        try {
            const { coord, depth, debit, status, place } = req.body;
    
            // Проверка наличия всех необходимых параметров
            if (!coord || !depth || !debit || !status) {
                return res.status(400).json({ message: "Все поля (coord, depth, debit, status) обязательны" });
            }
            console.log(coord)
            console.log(coord.split(","))
            // Проверка существования скважины с такими же координатами
            const existingWell = await db.query(
                "SELECT COUNT(*) as count FROM well WHERE x = ? and y =?",
                [coord.split(",")[0], coord.split(",")[1]]
            );
    
            if (existingWell[0].length > 0) {
                return res.status(409).json({ message: "Скважина с такими координатами уже существует" });
            }
    
            // Вставка новой скважины
            const result = await db.query(
                "INSERT INTO well (x, y, depth, debit, status, place) VALUES (?, ?, ?, ?, (select id from status where name = ?), (select id from place where name = ?))",
                [coord.split(",")[0], coord.split(",")[1], depth, debit, status, place]
            );
            
            console.log(result)
            if (result[0].affectedRows > 0) {
                res.status(201).json({ message: "Скважина успешно добавлена", wellId: result.insertId });
            } else {
                res.status(500).json({ message: "Не удалось добавить скважину" });
            }
        } catch (error) {
            console.error("Ошибка при добавлении скважины:", error);
            res.status(500).json({ message: "Внутренняя ошибка сервера" });
        }
    });
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
