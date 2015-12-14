'use strict';

function stripTags(html) {
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

(function () {
    const pageSize = 5;
    var offset = 0;

    $('#search-string').keypress(function(e){
        if(e.keyCode == 13)
            $('#find').click();
    });
    
    function refreshBooks () {
        if( $('#find-book').hasClass("active") ) {
            $('#find').click();
        } else if ($('#my-books').hasClass("active")) {
            displayBooks("my");
        } else if ($('#all-books').hasClass("active")) {
            displayBooks("all");        
        } else if ($('#book-requests').hasClass("active")) {
            displayBooks("request");
        }
    }

   function layoutBooks (results) {
        var output = "";

        for(var i = 0; i < results.items.length; i++) {
            output += '<div class="row"><div class="col-sm-2">' + (results.items[i].volumeInfo.imageLinks != null ? '<img src="' + 
                          results.items[i].volumeInfo.imageLinks.smallThumbnail + '"></img>' : '') + '</div>';
            output += '<div class="col-sm-3"><a target="_blank" href="' + results.items[i].volumeInfo.infoLink + 
                          '"><h4>' + results.items[i].volumeInfo.title + '</h4></a><h5>' + 
                          (results.items[i].volumeInfo.authors != null ? results.items[i].volumeInfo.authors.join('<br/>') : '') + '</h5></div>';
            output += '<div class="col-sm-5">' + stripTags(results.items[i].volumeInfo.description).substring(0, 500) + '&hellip;</div>';
            
            if( $('#find-book').hasClass("active") ) {
                output += '<div class="col-sm-1"><button class="btn add-book" id="' + results.items[i].id + '">Add</button></div>';
            } else if ($('#my-books').hasClass("active")) {
                output += '<div class="col-sm-1"><button class="btn remove-book" id="' + results.items[i].refId + '">Remove</button></div>';                
            } else if ($('#all-books').hasClass("active")) {
                output += '<div class="col-sm-1"><button class="btn request-book" id="' + results.items[i].refId + 
                    '"' + (results.items[i].requestedBy ? ' disabled' : '') + '>Request</button></div>'; 
            } else if ($('#book-requests').hasClass("active")) {
                output += '<div class="col-sm-2"><button class="btn btn-success accept-request" id="' + results.items[i].refId + '">Yes</button>' +
                    '<button class="btn btn-danger reject-request" id="' + results.items[i].refId + '">No</button></div>';
            }
            
            if ($('#book-requests').hasClass("active") == false) {
                output += '<div class="col-sm-1" style="width:70px; text-align:right;"><span>(' + (offset + i + 1) + ')</span></div>';
            }
            output += '</div>';
        }
        
        output += '<div class="row">' +
            '<div class="col-sm-1"><button class="btn get-prev"' + (offset <= 0 ? ' disabled' : '') + '>' +
                '<span class="glyphicon glyphicon-triangle-left"></span> Prev</button></div>' +
            '<div class="col-sm-9"></div>' +
            '<div class="col-sm-1"><button class="btn get-next"' + (offset >= results.totalItems - pageSize ? 'disabled' : '') +
                '>Next <span class="glyphicon glyphicon-triangle-right"></span></button></div></div>';
         
        $('#results').html(output);
          
        $('.get-prev').click( function () {
            offset -= pageSize;
            refreshBooks();
        });
          
        $('.get-next').click( function () {
            offset += pageSize;
            refreshBooks();
        });
      
        $('.add-book').click( function () {
            var url = window.location.origin + '/api/books/' + this.id;
            $.post(url, function (results) {
                offset = 0;
                $('#my-books').click();
            });
        });
      
        $('.remove-book').click( function () {
            var url = window.location.origin + '/api/books/' + this.id;
            $.ajax({url: url, type: 'DELETE', success: function (results) { 
                refreshBooks();
            }});
        });
        
        $('.request-book').click( function () {
            var url = window.location.origin + '/api/books/' + this.id;
            $.ajax({url: url, type: 'PUT', success: function (results) { 
                refreshBooks();
            }});
        }); 
        
        $('.accept-request').click( function () {
            var url = window.location.origin + '/api/request/book/' + this.id;
            $.post(url, function (results) { 
                refreshBooks();
            });
        });   
        
        $('.reject-request').click( function () {
            var url = window.location.origin + '/api/request/book/' + this.id;
            $.ajax({url: url, type: 'DELETE', success: function (results) { 
                refreshBooks();
            }});
        });
    }
    
    function getDataForBooks(results) {
       	var books = { totalItems: results.length, items: [] };
       	var max = results.length > offset + pageSize ? offset + pageSize : results.length;
		for(var i = offset; i < max; i++) {
			var url = 'https://www.googleapis.com/books/v1/volumes/' + results[i].bookid + 
			    '?key=AIzaSyA3SsOL_50qgKjEelYhQKLflaoUtVxJOuU&projection=lite';
			$.ajax({url: url, async: false, success: function(result) {
			    result["refId"] = results[i].id;
			    result["requestedBy"] = results[i].requestedBy;
				books.items.push(result);
			}});
		}
		return books;
    }
    
    function initialiseMode (menu) {
        $("li").removeClass("active");
        $(menu).addClass("active");
        offset = 0;        
    }
    
    function displayBooks(whose) {
        $('#results').html('<div class="center-this"><i class="fa fa-spinner fa-pulse fa-5x"></i></div>');
        var url = window.location.origin + '/api/' + whose + '/books';
        $.get(url, function (results) {
            layoutBooks(getDataForBooks(results));
        });        
    }
    
    $('#all-books').click( function () {
        initialiseMode(this);
        $('#book-search').hide();
        displayBooks("all");
    });
    
     $('#book-requests').click( function () {
        initialiseMode(this);
        $('#book-search').hide();
        displayBooks("request");
    });
    
    $('#my-books').click( function () {
        initialiseMode(this);
        $('#book-search').hide();
        displayBooks("my");
    });
    
    $('#find-book').click( function () {
        initialiseMode(this);
        $('#book-search').show();
        $('#results').empty();
    });
           
    $('#find').click( function () {
        var url = 'https://www.googleapis.com/books/v1/volumes?key=AIzaSyA3SsOL_50qgKjEelYhQKLflaoUtVxJOuU&projection=lite' +
            '&maxResults=' + pageSize + '&startIndex=' + offset + '&q=' + $('#search-string').val().replace(' ', '+');
        $.get(url, layoutBooks);
    });
    
    $('#find-book').click();
    
/*    ReactDOM.render(
        <p>Hello World!</p>,
        document.getElementById('content')
    ); */
})();
