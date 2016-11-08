// Обработка форм с помощью ExpressJS

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

// Подключаем роутер - ? (взял из примера в интернете, не понимаю нужен ли?)
app.use(router);

// Показываем папку, которая должна быть подключена к проекту
app.use(express.static(path.join(__dirname, 'public')));

// Разбираем application/x-www-form-urlencoded
app.use( bodyParser.urlencoded() );

// Разбираем application/json
app.use( bodyParser.json() );

router.all('/', function (req, res, next) {
    console.log('Someone made a request!');
    next();
});

router.get('/*', function (req, res) {
    // Рендеринг шаблона
    res.render('index', {
        categoryType: req.query.category,
        quantity: req.query.quantity
    });
});

router.get('/', function (req, res) {
    // Рендеринг шаблона
    res.render('index');
});

// Обработка POST запроса
app.post('/', function (req, res) {

    const category = req.body.category;
    const quantity = req.body.quantity;
    const url = 'https://ria.ru/' + category;
    var data = parser(url, quantity);

    console.log(data);

    res.redirect('/?category=' + category + '&quantity=' + quantity);

    res.render('index', {
        categoryType: req.body.category,
        img: data.img,
        title: data.title,
        text: data.text,
        time: data.time,
        date: data.date,
        comments: data.comments,
        views: data.views,
        amount: data.amount
     });
    
});

function parser(url, q)
{
    var data = {};
    data.img = [];
    data.title = [];
    data.text = [];
    data.time = [];
    data.date = [];
    data.comments = [];
    data.views = [];
    data.amount = [];

    request(url, function (error, response, html)
    {
        if (error)
        {
            throw error;
        }

        if (response.statusCode !== 200)
        {
            console.log('Incorrect statusCode: ' + response.statusCode);
        }

        var $ = cheerio.load(html);

        // Записываем отдельные значения новостей в массивы
        $('.b-list__item').each(function (i, elem)
        {
            if (i === +q) return false;
            data.img[i] = $(elem).find('img').attr('src');
            data.title[i] = $(elem).find('a').text().trim();
            data.text[i] = $(elem).find('.b-list__item-announce').text().trim();
            data.time[i] = $(elem).find('.b-list__item-time').text().trim();
            data.date[i] = $(elem).find('.b-list__item-date').text().trim();
            data.comments[i] = $(elem).find('.m-comments > .b-statistic__number').text().trim();
            data.views[i] = $(elem).find('.m-views > .b-statistic__number').text().trim();
            data.amount[i] = i;
        });

    });

    return data;
}

app.listen(8000, function () {
    console.log('Server was running on: ', 8000);
});