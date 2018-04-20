$(document).ready(function() {
  const dataStore = window.localStorage;
  const clientID = "CKD4C_WLhbnNIQ";
  const imgurClientID = "e14d0c3e92233e1";
  let shopsArray = [];
  let timeFrame = "month";
  let paginationAfter = "";
  let scrollTop;

  // checks if the user already has a device ID locally stored. It will set one if they do not or it will continue with the request if they do.
  function init() {
    !dataStore.getItem("deviceID") ? dataStore.setItem("deviceID", getRandomID()) : grabOriginals()
  } // end of init()

  // set a random deviceID for the user
  function getRandomID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      let r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  } // end of getRandomID()

  // checks if the user has a valid auth token and then proceeds with the query if they do
  function grabOriginals() {
    !validToken() ? getAccessToken() : query(queryCallback)
  } // end of grabOriginals()

  // function to use inside of grabOriginals() to check if user has valid auth token and its expiration. If the token is going to expire in less than 5 minutes, it will grab a new token.
  function validToken() {
    if (!dataStore.getItem("accessToken")) {
      return false;
    }

    const currentDate = new Date();
    const expires = new Date(dataStore.getItem("expires"));
    const difference = expires.getTime() - currentDate.getTime();
    const minutesDifference = Math.ceil(difference / (1000 * 60));
    if (minutesDifference < 5) {
      return false;
    }
    return true;
  }

  // requests an access token by using the clientID and custom deviceID. It then locally stores the token and its expiration.
  function getAccessToken() {
    $.ajax({
      type: "post",
      url: "https://www.reddit.com/api/v1/access_token",
      dataType: "json",
      headers: {
        Authorization: `Basic ${btoa(`${clientID}:` + "")}`
      },
      data: {
        grant_type: "https://oauth.reddit.com/grants/installed_client",
        device_id: dataStore.getItem("deviceID")
      },
      success: function(data) {
        if (data.access_token) {
          dataStore.setItem("accessToken", data.access_token);
          dataStore.setItem(
            "expires",
            new Date().addHours(data.expires_in / 3600)
          );
          grabOriginals();
        }
      },
      error: function(err) {
        console.log(err);
      }
    });
  } // end of getAccessToken

  // perform the subreddit get request after the user has valid token
  function query(callback) {
    $.ajax({
      type: "get",
      url: `https://oauth.reddit.com/r/photoshopbattles/top/?sort=top&t=${timeFrame}&after=${paginationAfter}`,
      dataType: "json",
      headers: {
        Authorization: `Bearer ${dataStore.getItem("accessToken")}`
      },
      success: function(data) {
        callback(data);
      },
      error: function(err) {
        console.log(err);
      }
    });
  } // end of query()

  // function to handle the data after a successful request
  function queryCallback(data) {
    const posts = data.data.children;
    paginationAfter = data.data.after;

    $.each(posts, function(index, post) {
      // remove "PsBattle" and "this" from the titles and then capitalize the first letter
      let originalTitle = post.data.title.replace("PsBattle: ", "").replace("This ", "").replace("this ", "");
      originalTitle = originalTitle.charAt(0).toUpperCase() + originalTitle.slice(1);
      let originalImage = post.data.url;
      // if the url is http change it to https to prevent tracker protection
      if(originalImage.indexOf("http:") > -1){originalImage.replace("http", "https")}

      $("#originals").append(
        `<div class="originalCard">
          <div class="originalImage">
            <div style="background-image: url('${originalImage}');"></div>
          </div>
          <div class="originalInfo">
            <p>${originalTitle}</p>
            <a href="#" class="viewShops" data-url="${post.data.permalink}" data-title="${originalTitle}">View Photoshops</a>
          </div>
        </div>`);
    }); // end of $.each
  } // end of queryCallback

  // perform the get request on the specific reddit post that the user clicks on
  function postQuery(callback, permalink) {
    $.ajax({
      type: "get",
      url: `https://oauth.reddit.com${permalink}?sort=best`,
      dataType: "json",
      headers: {
        Authorization: `Bearer ${dataStore.getItem("accessToken")}`
      },
      success: function(data) {
        callback(data);
      },
      error: function(err) {
        console.log(err);
      }
    });
  } // end of postQuery()

  // function to handle the data for a specific reddit post
  function postQueryCallback(data) {
    let originalImage = data[0].data.children[0].data.url;
    let originalTitle = data[0].data.children[0].data.title.replace("PsBattle: ", "").replace("This ", "").replace("this ", "");
    originalTitle = originalTitle.charAt(0).toUpperCase() + originalTitle.slice(1); // Need a function for this
    let originalLink = data[0].data.children[0].data.permalink;
    let shoppedImages = data[1].data.children;
    shopsArray = [];
    // if the url is http change it to https to prevent tracker protection
    if(originalImage.indexOf("http:") > -1){originalImage.replace("http", "https")}

    // add the original reddit post image to the left
    $("#originalArea").append(
      `<div>
        <p>Original Image</p>
        <h2>${originalTitle}</h2>
        <img src="${originalImage}">
        <div>
          <a href="${originalImage}" target="_blank">View Full Size</a>
          <a href="https://www.reddit.com${originalLink}" target="_blank">View on Reddit</a>
        </div>
      </div>`);

    // for each parent comment in the reddit post, filter out the relevant data
    $.each(shoppedImages, function(index, photoshop) {
      // ignore the pagination object at the end
      if (photoshop.kind === "t1") {
        let author = photoshop.data.author;
        let body = photoshop.data.body;
        let link = `https://www.reddit.com${photoshop.data.permalink}`;
        let title, shoppedImageURL;

        // remove those stupid \n line breaks from the innerHTML
        if (body.indexOf("\n") > 0) {
          body = body.replace("\n", " ");
        }

        // if the comment used a markdown link
        if (body.indexOf("[") >= 0) {
          title = `"${body.substring(body.indexOf("[") + 1, body.indexOf("]"))}"`;
          shoppedImageURL = body.substring(body.indexOf("(") + 1, body.indexOf(")"));
        }
        // otherwise check if the comment contains an image link and set shoppedImageURL to that
        else {
          bodyArr = body.split(" ");
          $.each(bodyArr, function(index, string) {
            if (string.indexOf("http") >= 0) {
              shoppedImageURL = bodyArr[index];
            }
          });
          title = "(no caption)";
        }

        // change the title to no caption if the title is the same as the link
        if (title.indexOf("http") > -1) {
          title = "(no caption)";
        }

        // if the comment was posted with an imgur album or gallery link then pull the jpg url out of it
        if (shoppedImageURL.indexOf("/a/") > 0 || shoppedImageURL.indexOf("/gallery/") > 0) {
          getImgurJpeg(shoppedImageURL, author, title, link);
        } else {
          addImagesToArray(shoppedImageURL, author, title, link);
        }
      } // end of if kind === t1
    }); // end of $.each
    shoppedGallery(shopsArray);
  } // end of postQueryCallback()

  // grab the single image URLs if the parent comment containers an album or gallery before pushing to the array
  function getImgurJpeg(url, author, title, link) {
    let newURL;

    if (url.indexOf("/a/") > 0) {
      newURL = `album/${url.substring(url.indexOf("/a") + 3)}`;
    } else if (url.indexOf("/gallery/") > 0) {
      newURL = `gallery/${url.substring(url.indexOf("/gal") + 9)}`;
    }

    //
    $.ajax({
      url: `https://api.imgur.com/3/${newURL}`,
      type: "GET",
      headers: {
        "Authorization": `Client-ID ${imgurClientID}`,
      },
      dataType: "json",
      success: function(data) {
        let imageURL = data.data.images[0].link;
        addImagesToArray(imageURL, author, title, link);
      },
    });
  }

  function addImagesToArray(url, author, title, link) {
    // only add the object if the parent comment contains a valid image url
    if (url != "" && url.indexOf("http") > -1) {
      // if the image link does not have an image extension at the end then add .jpg
      if (url.indexOf(".jpg") == -1 && url.indexOf(".png") == -1 && url.indexOf(".gifv") == -1) {
        url = `${url}.jpg`;
      } else if (url.indexOf("gifv" > -1)) {
        url = url.replace("gifv", "gif");
      }
      let shoppedImage = {
        title: title,
        imageURL: url,
        author: author,
        link: link
      };
      shopsArray.push(shoppedImage);
    }
  }

  // handle the data of the photoshop submissions of the post that the user clicked on
  function shoppedGallery(photoshops) {
    let galleryIndex = 0;

    // append the data from the first photoshop to the right side by default
    $("#shoppedTitle").text(photoshops[galleryIndex].title);
    $("#shoppedImage").attr("src", photoshops[galleryIndex].imageURL);
    $("#shoppedButtons").append(
      `<a href="${photoshops[galleryIndex].imageURL}" target="_blank">View Full Size</a>
      <a href="${photoshops[galleryIndex].link}" target="_blank">View Comments</a>`
    );
    $("#username").text(`created by: ${photoshops[galleryIndex].author}`);

    $("#rightClick").on("click", function() {

      // only run if the gallery index is defined for photoshops
      if (galleryIndex < photoshops.length - 1) {
        galleryIndex++;

        // show the left button if index is off the first photoshop, hide the right button if index is on the last photoshop
        if (galleryIndex === 1) {
          $("#leftClick").css("display", "block");
        } else if (galleryIndex + 1 === photoshops.length) {
          $("#rightClick").css("display", "none");
        }

        $("#shoppedTitle").text(photoshops[galleryIndex].title);
        $("#shoppedImage").attr("src", photoshops[galleryIndex].imageURL);
        $("#shoppedButtons").empty();
        $("#shoppedButtons").append(
          `<a href="${photoshops[galleryIndex].imageURL}" target="_blank">View Full Size</a>
          <a href="${photoshops[galleryIndex].link}" target="_blank">View Comments</a>`
        );
        $("#username").text(`created by: ${photoshops[galleryIndex].author}`);
        return galleryIndex;
      }
    });

    $("#leftClick").on("click", function() {
      if (galleryIndex != 0) {
        galleryIndex--;

        // hide the left button if index is on first photoshop, show the right button if index is off last photoshop
        if (galleryIndex === 0) {
          $("#leftClick").css("display", "none");
        } else if (galleryIndex === photoshops.length - 2) {
          $("#rightClick").css("display", "block");
        }

        $("#shoppedTitle").text(photoshops[galleryIndex].title);
        $("#shoppedImage").attr("src", photoshops[galleryIndex].imageURL);
        $("#shoppedButtons").empty();
        $("#shoppedButtons").append(
          `<a href="${photoshops[galleryIndex].imageURL}" target="_blank">View Full Size</a>
          <a href="${photoshops[galleryIndex].link}" target="_blank">View Comments</a>`
        );
        $("#username").text(`created by: ${photoshops[galleryIndex].author}`);
        return galleryIndex;
      }
    });
  } // end of shoppedGallery()

  // adds an addHours() method to the Date prototype to calculate the token expiration time
  Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + h * 60 * 60 * 1000);
    return this;
  };

  // grab the "View Shops" anchor handle (dynamically appended) to interact with the modal
  $("#originals").on("click", "a.viewShops", function() {
    let permalink = $(this).data().url;
    scrollTop = $(document).scrollTop();

    $("body").css("overflow-y", "hidden");
    postQuery(postQueryCallback, permalink);
    $("#modal").css("display", "flex");
  });

  // empty the modal content when it is closed and remove the arrow button events
  $("#close").on("click", function() {
    $("body").css("overflow-y", "auto");
    $(document).scrollTop(scrollTop);
    $("#modal").css("display", "none");
    $("#originalArea").empty();
    $("#shoppedTitle").empty();
    $("#shoppedImage").attr("src", "");
    $("#shoppedButtons").empty();
    $("#username").text("");
    $("#leftClick").css("display", "none");
    $("#rightClick").css("display", "block");
    $("#leftClick").off();
    $("#rightClick").off();
  });

  // clear the body and append new reddit posts sorted by timeframe
  $(".sorter").on("click", function() {
    let index = $(this).index();
    $("#originals").empty();
    paginationAfter = "";

    $(".sorter").css({
      "color": "rgb(51, 102, 153)",
      "text-shadow": "none"
    });
    $(this).css({
      "color": "#ff4500",
      "text-shadow": "0px 1px 0px black"
    });

    if (index === 1) {
      timeFrame = "all";
    } else if (index === 2) {
      timeFrame = "year";
    } else if (index === 3) {
      timeFrame = "month";
    } else if (index === 4) {
      timeFrame = "week";
    }
    init();
  });

  // use the pagination set in queryCallback() to append more posts
  $("#more>div").on("click", function() {
    shopsArray = [];
    query(queryCallback);
  });

  init();
}); // end of document.ready()

// https://jsdeveloper.io/reddit-api-application-oauth-javascript/
