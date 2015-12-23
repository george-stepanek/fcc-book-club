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
        if(e.keyCode == 13) {
            $('#find').click();
        }
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
    
    var Book = React.createClass({
        render: function() {
            var imageThumb = '';
            if(this.props.book.volumeInfo.imageLinks != null) {
                imageThumb = (
                    <img src={this.props.book.volumeInfo.imageLinks.smallThumbnail}></img>
                );
            }
            
            var submitButton = '';
            if( $('#find-book').hasClass("active") ) {
                submitButton =  (
                    <div className="col-sm-1">
                        <button className="btn add-book" id={this.props.book.id}>Add</button>
                    </div>
                );
            } else if ($('#my-books').hasClass("active")) {
                submitButton =  (
                    <div className="col-sm-1">
                        <button className="btn remove-book" id={this.props.book.refId}>Remove</button>
                    </div>
                );
            } else if ($('#all-books').hasClass("active")) {
                submitButton = (
                    <div className="col-sm-1">
                        <button className="btn request-book" id={this.props.book.refId} disabled={this.props.book.requestedBy}>Request</button>
                    </div>
                );
            } else if ($('#book-requests').hasClass("active")) {
                submitButton = (
                    <div className="col-sm-2">
                        <button className="btn btn-success accept-request" id={this.props.book.refId}>Yes</button>
                        <button className="btn btn-danger reject-request" id={this.props.book.refId}>No</button>
                    </div>
                );
            }
            
            var indexer = '';
            if ($('#book-requests').hasClass("active") == false) {
                indexer = (
                    <div className="col-sm-1 row-index">
                        <span>({offset + this.props.index + 1})</span>
                    </div>
                );
            }
            
            return (
                <div className="row">
                    <div className="col-sm-2">
                        {imageThumb}
                    </div>
                    <div className="col-sm-3">
                        <a target="_blank" href={this.props.book.volumeInfo.infoLink}>
                            <h4>{this.props.book.volumeInfo.title}</h4>
                        </a>
                        <h5>{this.props.book.volumeInfo.authors != null ? this.props.book.volumeInfo.authors.join(', ') : ''}</h5>
                    </div>
                    <div className="col-sm-5">
                        {stripTags(this.props.book.volumeInfo.description).substring(0, 500) + '…'}
                    </div>
                    {submitButton}
                    {indexer}
                </div>
            );
        }
    });
    
    var BooksPanel = React.createClass({
        handleGetNext: function () {
            offset += pageSize;
            refreshBooks();
        },
        handleGetPrev: function () {
            offset -= pageSize;
            refreshBooks();
        },
        render: function() {
            var bookRows = this.props.books.items.map(function(book, index) {
                return (
                    <Book book={book} index={index} />
                );
            });
            return (
                <div className="panel-body">
                    {bookRows}
                    <div className="row">
                        <div className="col-sm-1">
                            <button className="btn get-prev" onClick={this.handleGetPrev} disabled={offset <= 0}>
                                <span className="glyphicon glyphicon-triangle-left" ></span> Prev
                            </button>
                        </div>
                        <div className="col-sm-9"></div>
                        <div className="col-sm-1">
                            <button className="btn get-next" onClick={this.handleGetNext} disabled={offset >= this.props.books.totalItems - pageSize}>
                                Next <span className="glyphicon glyphicon-triangle-right"></span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    });

    function layoutBooks (results) {
        ReactDOM.render(
            <BooksPanel books={results} />,
            document.getElementById('results')
        );
     
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
        ReactDOM.render(
            <div className="center-this"><i className="fa fa-spinner fa-pulse fa-5x"></i></div>,
            document.getElementById('results')
        );
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
        ReactDOM.render(
            <div className="panel-body"></div>,
            document.getElementById('results')
        );
    });
           
    $('#find').click( function () {
        var url = 'https://www.googleapis.com/books/v1/volumes?key=AIzaSyA3SsOL_50qgKjEelYhQKLflaoUtVxJOuU&projection=lite' +
            '&maxResults=' + pageSize + '&startIndex=' + offset + '&q=' + $('#search-string').val().replace(' ', '+');
        $.get(url, layoutBooks);
    });
    
    $('#my-books').click();
})();
