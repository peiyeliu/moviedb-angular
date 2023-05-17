const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors')

app.use(cors())
require('dotenv').config();

const apiKey = process.env.API_KEY;

const prefix = 'https://api.themoviedb.org/3';
const suffix  = `?api_key=${apiKey}&language=en-US&page=1`;

const DEFAULT_VIDEO_ID = 'tzkWB85ULJY';

const currPlayingUrl = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`;
const popMovUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
const trendMovUrl = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`;
const topMovUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`;
const popTvUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=1`;
const trendTvUrl = `https://api.themoviedb.org/3/trending/tv/day?api_key=${apiKey}`;
const topTvUrl = `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=en-US&page=1`;


/**
 * this function will convert time format for movie/tv reviews
 * @param input the input format is '2023-04-21T20:21:15.742Z'
 * @returns {string} the output format is 'Apr 21,2023 8:21:15 PM'
 * an empty string will be returned if the input is invalid
 */
function convertTimeFormat(input) {
    if (!input) {return '';}
    const date = new Date(input);
    if (isNaN(date)) {return '';}
    const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
    const day = date.getDate();
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${month} ${day},${year} ${formattedHour}:${minute}:${second} ${period}`;
}


/**
 * this function will parse the reviewer image path in string format
 * if the path is invalid, return a default image
 * @param p the path
 * @returns {string} the reviewer image path for the front-end
 */
function avatarPathParser(p) {
    if (p === null || p.length === 0) {
        return 'https://bytes.usc.edu/cs571/s21_JSwasm00/hw/HW8/ReviewsPlaceholderImage.jpg';
    }
    if (p.startsWith('/https')) {
        return p.substring(1);
    } else if (p.startsWith('/')) {
        return 'https://image.tmdb.org/t/p/original' + p;
    }
    return 'https://bytes.usc.edu/cs571/s21_JSwasm00/hw/HW8/ReviewsPlaceholderImage.jpg';
}


/**
 * get homepage data
 */
app.get('/', function (req, res) {
    const homePageData = {currPlaying: null, popMov: null, trendMov: null, topMov: null, popTv: null, trendTv: null, topTv: null};

    axios.all([axios.get(currPlayingUrl), axios.get(popMovUrl), axios.get(trendMovUrl), axios.get(topMovUrl), axios.get(popTvUrl), axios.get(trendTvUrl), axios.get(topTvUrl)]).then(
        axios.spread(
            function (currPlay, popMov, trendMov, topMov, popTv, trendTv, topTv) {
                homePageData.currPlaying = currPlay.data;
                homePageData.popMov = popMov.data;
                homePageData.trendMov = trendMov.data;
                homePageData.topMov = topMov.data;
                homePageData.popTv = popTv.data;
                homePageData.trendTv = trendTv.data;
                homePageData.topTv = topTv.data;
                res.json(homePageData);
            }
        )
    ).catch(error => {
        console.log(error);
    });
});


function handleRequest(req, res) {
    const urlMap = {
        '/topmovie': topMovUrl,
        '/popmovie': popMovUrl,
        '/currentmovie': currPlayingUrl,
        '/toptv': topTvUrl,
        '/poptv': popTvUrl,
        '/currenttv': trendTvUrl
    };

    const apiUrl = urlMap[req.path];
    if (!apiUrl) {
        return res.status(404).send('Not found');
    }

    axios.get(apiUrl)
        .then(response => res.json(response.data))
        .catch(error => console.log(error));
}

app.get('/topmovie', handleRequest);
app.get('/popmovie', handleRequest);
app.get('/currentmovie', handleRequest);
app.get('/toptv', handleRequest);
app.get('/poptv', handleRequest);
app.get('/currenttv', handleRequest);



/**
 * get search data when use typing in the search box
 */
app.get('/search/*', async (req, res) => {
    if (req.url.substring(8) === "") {
        const searchData = {
            results: []
        };
        return res.json(searchData);
    }

    const searchURL = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=en-US&query=${req.url.substring(8)}`;

    try {
        const response = await axios.get(searchURL);
        const resultNum = Math.min(response.data.results.length, 10);

        const searchData = {
            results: response.data.results
                .slice(0, resultNum)
                .filter(result => result && result.backdrop_path !== null)
                .filter(result => result.media_type === 'tv' || result.media_type === 'movie')
                .map(result => ({
                    type: result.media_type,
                    path: result.backdrop_path,
                    id: result.id,
                    name: result.media_type === 'tv' ? result.name : result.original_title
                }))
        };

        return res.json(searchData);
    } catch (error) {
        console.log(error);
    }
});



/**
 * get data of a specific movie/tv
 */
app.get('/watch/*/*', function (req, res) {
    const elementData = {
        typeurl: null,
        type: null,
        detailData: null,
        youtube: null,
        allCastData: null,
        reviewData: null,
        similarData: null,
        recomData: null
    };
    const detailURL = prefix + req.url.substring(6) + suffix;
    const youtubeURL = prefix + req.url.substring(6) + '/videos' + suffix;
    const allCastURL = prefix + req.url.substring(6) + '/credits' + suffix;
    const reviewURL = prefix + req.url.substring(6) + '/reviews' + suffix;
    const similarURL = prefix + req.url.substring(6) + '/similar' + suffix;
    const recomURL = prefix + req.url.substring(6) + '/recommendations' + suffix;

    if (req.url.substring(7, 9) === 'tv') {
        elementData.type = 'TV Shows';
        elementData.typeurl = 'tv';
    } else {
        elementData.type = 'Movies';
        elementData.typeurl = 'movie';
    }


    axios.all([
        axios.get(detailURL),
        axios.get(youtubeURL),
        axios.get(allCastURL),
        axios.get(reviewURL),
        axios.get(similarURL),
        axios.get(recomURL)
    ]).then(
        axios.spread(function (detail, youtube, allCast, review, similar, recom) {
            elementData.detailData = detail.data;
            elementData.youtube = youtube.data['results'][0]?.key || DEFAULT_VIDEO_ID;
            elementData.allCastData = allCast.data;
            elementData.allCastData = {cast: allCast.data.cast.filter(cast => cast.profile_path !== null)};
            elementData.reviewData = {results: review.data.results.slice(0, 10)};
            for (let i = 0; i < elementData.reviewData.results.length; i++) {
                elementData.reviewData.results[i]['created_at'] = convertTimeFormat(elementData.reviewData.results[i]['created_at']);
                elementData.reviewData.results[i]['author_details']['avatar_path'] = avatarPathParser(elementData.reviewData.results[i]['author_details']['avatar_path']);
            }

            elementData.similarData = similar.data;
            elementData.recomData = recom.data;

            let year = (elementData.detailData['release_date'] ?? elementData.detailData['first_air_date'])?.substring(0, 4) || "";
            let time = "";
            if (elementData.detailData.runtime != null) {
                const runtime = elementData.detailData.runtime;
                const hour = Math.trunc(runtime / 60);
                const min = runtime % 60;
                const hourStr = hour > 1 ? "hrs" : "hr";
                const minStr = min > 1 ? "mins" : "min";
                time = `${hour} ${hourStr} ${min} ${minStr}`;
            } else if (
                elementData.detailData.episode_run_time != null &&
                elementData.detailData.episode_run_time.length > 0
            ) {
                const runtime = elementData.detailData.episode_run_time[0];
                const hour = Math.trunc(runtime / 60);
                const min = runtime % 60;
                const hourStr = hour > 1 ? "hrs" : "hr";
                const minStr = min > 1 ? "mins" : "min";
                time = `${hour} ${hourStr} ${min} ${minStr}`;
            }

            let genreStr = elementData.detailData.genres.map(genre => genre.name).join(', ');
            let languageStr = elementData.detailData.spoken_languages.map(language => language.name).join(', ');

            elementData.detailData['year'] = year;
            elementData.detailData['time'] = time;
            elementData.detailData['genreStr'] = genreStr;
            elementData.detailData['languageStr'] = languageStr;

            res.json(elementData);
        })
    ).catch(error => {
        console.log(error);
    })
});


/**
 * get the data of casts
 */
app.get('/person/*', function (req, res) {
    const castURL = 'https://api.themoviedb.org/3/person/' + req.url.substring(8) + '?api_key=' + apiKey + '&language=en-US&page=1';
    const externalURL = 'https://api.themoviedb.org/3/person/' + req.url.substring(8) + '/external_ids?api_key=' + apiKey + '&language=en-US&page=1';
    const person = {
        cast: null,
        external: null,
        alsoKnownAs: null
    }

    axios.all([axios.get(castURL), axios.get(externalURL)]).then(axios.spread(
        function (castData, externalData) {
            person.cast = castData.data;
            person.external = externalData.data;
            person.alsoKnownAs = "";
            for (let i = 0; i < castData.data.also_known_as.length; i++) {
                person.alsoKnownAs += castData.data.also_known_as[i];
                if (i < castData.data.also_known_as.length - 1) {
                    person.alsoKnownAs += ', ';
                }
            }
            return res.json(person);
        }
    ))
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    if (PORT === 3000) {
        console.log("Backend Application listening at port 3000: http://localhost:3000")
    }
})

module.exports = app;
