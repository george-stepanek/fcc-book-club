'use strict';

(function () {
    
    const pageSize = 5;
    var offset = 0;

    $('input').keypress(function(e){
        if(e.keyCode == 13)
            $('.find-books').click();
    });

    $("document").ready($.get(window.location.origin + '/api/:id', function (user) {
        $('#display-name').html(user.displayName);
    }));

   function displayBooks (results) {
      var output = "";

        for(var i = 0; i < results.items.length; i++) {
            output = output + '<div class="row">' +
                '<div class="col-sm-2">' + (results.items[i].volumeInfo.imageLinks != null ? '<img src="' + 
                    results.items[i].volumeInfo.imageLinks.smallThumbnail + '"></img>' : '') + '</div>' + 
                '<div class="col-sm-3"><a target="_blank" href="' + results.items[i].volumeInfo.infoLink + 
                   '"><h4>' + results.items[i].volumeInfo.title + '</h4></a><h5>' + 
                   (results.items[i].volumeInfo.authors != null ? results.items[i].volumeInfo.authors.join('<br/>') : '') + '</h5></div>' + 
                '<div class="col-sm-5">' + (results.items[i].searchInfo != null ? results.items[i].searchInfo.textSnippet : '') + '</div>' +
                '<div class="col-sm-1"><button class="btn add-book" id="' + results.items[i].id + '">Add</button></div>' +
                '<div class="col-sm-1" style="width:70px; text-align:right;"><span>(' + (offset + i + 1) + ')</span></div></div>';
        }
        output = output + '<div class="row">' +
            '<div class="col-sm-1"><button class="btn find-prev"' + (offset <= 0 ? ' disabled' : '') + '>' +
                '<span class="glyphicon glyphicon-triangle-left"></span> Prev</button></div>' +
            '<div class="col-sm-9"></div>' +
            '<div class="col-sm-1"><button class="btn find-next"' + (offset >= results.totalItems - pageSize ? 'disabled' : '') +
                '>Next <span class="glyphicon glyphicon-triangle-right"></span></button></div></div>';
         
      $('#results').html(output);
      
      $('.find-prev').click( function () {
         offset -= pageSize;
         $('.find-books').click();
      });
      
      $('.find-next').click( function () {
         offset += pageSize;
         $('.find-books').click();
      });
    }
       
    $('.find-books').click( function () {
        var url = 'https://www.googleapis.com/books/v1/volumes?key=AIzaSyA3SsOL_50qgKjEelYhQKLflaoUtVxJOuU&projection=lite' +
            '&maxResults=' + pageSize + '&startIndex=' + offset + '&q=' + $('input').val().replace(' ', '+');
        $.get(url, displayBooks);
    });
    
    // TEMP -- FOR TESTING ONLY
    $('input').val('Ann Rice Vampire');
    $('.find-books').click();
   
})();
