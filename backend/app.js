const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors')

app.use(cors())
require('dotenv').config();

const apiKey = process.env.API_KEY;

const prefix = 'https://api.themoviedb.org/3';
const suffix  = '?api_key=' + apiKey + '&language=en-US&page=1';

const monthList = ['', 'January', 'February', "March", 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const DEFAULT_VIDEO_ID = 'tzkWB85ULJY';

/**
 * get homepage data
 */
app.get('/', function (req, res) {
    const currPlayingUrl = 'https://api.themoviedb.org/3/movie/now_playing?api_key=' + apiKey + '&language=en-US&page=1';
    const popMovUrl = 'https://api.themoviedb.org/3/movie/popular?api_key=' + apiKey + '&language=en-US&page=1';
    const trendMovUrl = 'https://api.themoviedb.org/3/trending/movie/day?api_key=' + apiKey;
    const topMovUrl = 'https://api.themoviedb.org/3/movie/top_rated?api_key=' + apiKey + '&language=en-US&page=1';
    const popTvUrl = 'https://api.themoviedb.org/3/tv/popular?api_key=' + apiKey + '&language=en-US&page=1';
    const trendTvUrl = 'https://api.themoviedb.org/3/trending/tv/day?api_key=' + apiKey;
    const topTvUrl = 'https://api.themoviedb.org/3/tv/top_rated?api_key=' + apiKey + '&language=en-US&page=1';

    const homePageData = {
        currPlaying: null,
        popMov: null,
        trendMov: null,
        topMov: null,
        popTv: null,
        trendTv: null,
        topTv: null
    };

    axios.all([
        axios.get(currPlayingUrl),
        axios.get(popMovUrl),
        axios.get(trendMovUrl),
        axios.get(topMovUrl),
        axios.get(popTvUrl),
        axios.get(trendTvUrl),
        axios.get(topTvUrl)
    ]).then(
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


/**
 * get search data when use type in the search box
 */
app.get('/search/*', function (req, res) {
    if (req.url.substring(8) === "") {
        let searchData = {
            results: []
        }
        return res.json(searchData);
    }
    const searchURL = 'https://api.themoviedb.org/3/search/multi?api_key=YOUR_TMDB_API_KEY&language=en-US&query=' + req.url.substring(8);
    axios.get(searchURL).then(
        response => {
            let searchData = {
                results: []
            }
            let resultNum = 10;
            if (response.data.results.length < 10) {
                resultNum = response.data.results.length;
            }
            let index = 0;

            for (let i = 0; i < resultNum; i++) {
                if (response.data.results[i] === null || response.data.results[i]['backdrop_path'] === null) {
                    continue;
                }

                if (response.data.results[i]['media_type'] === 'tv' || response.data.results[i]['media_type'] === 'movie') {
                    searchData.results[index] = {};
                    searchData.results[index]['type'] = response.data.results[i]['media_type'];
                    searchData.results[index]['path'] = response.data.results[i]['backdrop_path'];
                    searchData.results[index]['id'] = response.data.results[i]['id'];

                    if (response.data.results[i]['media_type'] === 'tv') {
                        searchData.results[index]['name'] = response.data.results[i]['name'];
                    } else {
                        searchData.results[index]['name'] = response.data.results[i]['original_title'];
                    }
                    index++;
                }
            }
            return res.json(searchData);
        }
    ).catch(error => {
        console.log(error);
    });
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

            if (youtube.data['results'][0] != null) {
                elementData.youtube = youtube.data['results'][0]['key'];
            } else {
                elementData.youtube = DEFAULT_VIDEO_ID;
            }

            elementData.allCastData = allCast.data;
            let tempCastData = {
                cast: []
            };
            let idx = 0;
            for (let i = 0; i < allCast.data.cast.length; i++) {
                if (allCast.data.cast[i]['profile_path'] == null) {
                    continue;
                }
                tempCastData.cast[idx] = allCast.data.cast[i];
                idx++;
            }
            elementData.allCastData = tempCastData;

            elementData.reviewData = review.data;

            if (elementData.reviewData.results.length > 10) {
                elementData.reviewData.results = elementData.reviewData.results.slice(0, 10);
            }

            for (let i = 0; i < elementData.reviewData.results.length; i++) {
                if (elementData.reviewData.results[i]['created_at'] === null) {
                    continue;
                }
                var reviewtime = "";
                var timestamp = elementData.reviewData.results[i]['created_at'];
                var month = monthList[parseInt(timestamp.substring(5, 7))];
                var date = timestamp.substring(8, 10);
                var year = timestamp.substring(0, 4);
                var minsec = timestamp.substring(13, 19);
                var hour = parseInt(timestamp.substring(11, 13));
                var isPM = 'AM';
                if (hour >= 12) {
                    isPM = 'PM';
                    if (hour > 12) {
                        hour -= 12;
                    }
                }
                reviewtime = month + " " + date + ", " + year + " " + hour + minsec + " " + isPM;
                elementData.reviewData.results[i]['created_at'] = reviewtime;
                elementData.reviewData.results[i]['author_details']['avatar_path'] = avatarPathParser(elementData.reviewData.results[i]['author_details']['avatar_path']);

            }

            elementData.similarData = similar.data;
            elementData.recomData = recom.data;

            var year = "";
            if (elementData.detailData['release_date'] != null) {
                year = elementData.detailData['release_date'].substring(0, 4);
            } else if (elementData.detailData['first_air_date'] != null) {
                year = elementData.detailData['first_air_date'].substring(0, 4);
            }
            var time = "";
            var hour = 0;
            var min = 0;
            var hourStr = "";
            var minStr = "";
            if (elementData.detailData['runtime'] != null) {
                hour = Math.trunc(elementData.detailData['runtime'] / 60);
                min = elementData.detailData['runtime'] % 60;
                hourStr = hour > 1 ? "hrs " : "hr";
                minStr = min > 1 ? "mins" : "min";
                time = hour + hourStr + " " + min + minStr;
            } else if (elementData.detailData['episode_run_time'] != null && elementData.detailData['episode_run_time'].length > 0) {
                hour = Math.trunc(elementData.detailData['episode_run_time'][0] / 60);
                min = elementData.detailData['episode_run_time'][0] % 60;
                hourStr = hour > 1 ? "hrs " : "hr";
                minStr = min > 1 ? "mins" : "min";
                time = hour + hourStr + " " + min + minStr;
            }
            var genreStr = "";
            var languageStr = "";
            for (let i = 0; i < elementData.detailData['genres'].length; i++) {
                genreStr += elementData.detailData['genres'][i]['name'];
                if (i < elementData.detailData['genres'].length - 1) {
                    genreStr += ', ';
                }
            }
            for (let i = 0; i < elementData.detailData['spoken_languages'].length; i++) {
                languageStr += elementData.detailData['spoken_languages'][i]['name'];
                if (i < elementData.detailData['spoken_languages'].length - 1) {
                    languageStr += ', ';
                }
            }
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
 * get the data of casts
 */
app.get('/person/*', function (req, res) {
    const castURL = 'https://api.themoviedb.org/3/person/' + req.url.substring(8) + '?api_key=YOUR_TMDB_API_KEY&language=en-US&page=1';
    const externalURL = 'https://api.themoviedb.org/3/person/' + req.url.substring(8) + '/external_ids?api_key=YOUR_TMDB_API_KEY&language=en-US&page=1';
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
