// Парсер новостей

var express = require('express');
var bodyParser = require('body-parser');
var template = require('consolidate').handlebars;
var path = require('path');
var cheerio = require('cheerio');
var request = require('request');

var app = express();
var router = express.Router();

// Определяем обработчик шаблонов
app.engine('hbs', template);

// Устанавливаем переменные для обработки шаблонов
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(router); // Подключаем роутер - ? (взял из примера в интернете, не понимаю нужен ли?)
app.use(express.static(path.join(__dirname, './public'))); // Показываем папку, которая должна быть подключена к проекту
app.use( bodyParser.urlencoded() ); // Разбираем application/x-www-form-urlencoded
app.use( bodyParser.json() ); // Разбираем application/json

router.all('/', function (req, res, next) {
    console.log('Someone made a request!');
    next();
});

router.get('/', function (req, res) {
    if (req.query.category && req.query.quantity) {
        parser(req, res);
    } else {
        res.render('index');
    }
});

// Обработка POST запроса
app.post('/', parser);

function parser(req, res) {

    if (req.body) {
        var category = req.body.category;
    } else { category = req.query.category }
    //const category = req.body.category;
    if (req.body) {
        var quantity = req.body.quantity;
    } else { quantity = req.query.quantity }
    //const quantity = req.body.quantity;

    const url = 'https://ria.ru/' + category;

    let data = [];

    request(url, function (error, response, html) {
        if (error) {
            throw error;
        }

        if (response.statusCode !== 200) {
            console.log('Incorrect statusCode: ' + response.statusCode);
        }

        let $ = cheerio.load(html);

        // Записываем отдельные значения новостей в объекты
        $('.b-list__item').each(function (i, elem) {
            if (i === +quantity) return false;

            data[i] = {
                img: $(elem).find('img').attr('src'),
                title: $(elem).find('a').text().trim(),
                text: $(elem).find('.b-list__item-announce').text().trim(),
                time: $(elem).find('.b-list__item-time').text().trim(),
                date: $(elem).find('.b-list__item-date').text().trim(),
                comments: $(elem).find('.m-comments > .b-statistic__number').text().trim(),
                views: $(elem).find('.m-views > .b-statistic__number').text().trim(),
                amount: i
            }
        });
        
        res.render('index', {
            categoryType: category,
            data
        });

        console.log(data);

    });
}

app.listen(8000, function () {
    console.log('Server was running on: ', 8000);
});