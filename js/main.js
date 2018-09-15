// prevent no-undef warning
const jQuery = window.jQuery;
const Handlebars = window.Handlebars;

jQuery(document).ready(function($)
{
	/*
	 1 - INIT
	*/

	var currentCard; //, targetCard;
	var MIN_CARD_ID = 1;
	var MAX_CARD_ID = 100;
	// var BASE_URL = 'https://labs.letemps.ch/interactive/2018/_digital-shapers/';
	// var URL_TRAIL = 'digital_shapers';

	setTimeout(function()
	{
		$('.overlay .logo-lt-blanc, .spinner').fadeOut();
		setTimeout(function()
		{
			$('.overlay').fadeOut();
		}, 500);
	}, 1000);

	$(".open-menu").on('click', function() {
		$('aside').addClass('is-open');
		$(this).addClass('is-white');
	});

	$(".close-menu").on('click', function() {
		$('aside').removeClass('is-open');
		$('.open-menu').removeClass('is-white');
	});



	var $overlayContent = $('.overlay-content'),
		$aside = $('aside');
	$(".overlay-content .start").on('click', function() {
		//alert('dsdsd');
		$overlayContent.addClass('is-hidden');
		setTimeout(function()
		{
			$overlayContent.fadeOut();
			$('.content').show(function(){
				$('.content').isotope({ filter: $filterValue });
				setTimeout(function()
				{
					if($(window).width() > 500)
					{
						$aside.css('-webkit-transform', 'translate(0,0)');
						$aside.css('transform', 'translate(0,0)');
					}
				}, 300);
			});
		}, 300);
	});


	/*
		3 - LOAD JSON
	*/
	$.getJSON( "json/data.json", function(response) {
  	//console.log( "success" );
  	displayCards(response);
  	//console.log(response);
		var cardObject;

		function getCardById(cardId){
			$.each(response.cards, function(key, item){
				if(item.cardId == cardId) {
					cardObject = item;
					return;
				}
			});
		}

  	// FAIT LE LIEN ENTRE LE DATA-CARDID ET LE BON GROUPE JSON
  	var source   = $("#detail-template").html();
		var template = Handlebars.compile(source);
		$(".card").on('click', function() {
			// SCROLL TO AN ELEMENT FUNCTION
			var cardId = $(this).data('cardid');
			$.each(response.cards, function(key, item){
				if(item.cardId == cardId) {
					cardObject = item;
					return;
				}
			});
			var html = template(cardObject);
			$( ".visualisator" ).html(html);
			currentCard = cardObject.cardId;
			//alert(cardId);

		});

		/*
			5 - DISPLAY CARDS
			inside getJSON to enable prev/next interactions
		*/

		function displayCards(arr) {
			var source = $("#card-template").html();
			var template = Handlebars.compile(source);

			var html = template({cards:arr.cards});
				$( ".content" ).html(html);

			var reader = $('.reader');
			var	content = $('.content');
			var visualisator = $('.visualisator');

			$(".card").not('.na').on('click', function() {
				$('html, body').animate({
			       scrollTop:$('.content').offset().top
			    }, 300);

			    $('.open-menu').css('display', 'none');

				$('.content, aside').fadeOut();
				reader.css('display', 'block');
				setTimeout(function()
				{
					reader.addClass('is-visible');
				}, 10);

				reader.prepend('<svg class="close-article" version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="81px" height="81px" viewBox="0 0 81 81" enable-background="new 0 0 81 81" xml:space="preserve"><rect class="bg" fill="#D4D926" width="81" height="81"/><rect class="cross" x="14.551" y="39.344" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -16.7757 40.5)" fill="#FFFFFF" width="51.898" height="2.312"/><rect class="cross" x="14.551" y="39.344" transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 40.5 97.7757)" fill="#FFFFFF" width="51.898" height="2.312"/></svg>');


				setTimeout(function()
				{
					visualisator.css("opacity", "1");

					// NOTE Add event handlers after a timeout

					$('.readMore').click(function(){
						$('.readMore').hide();
						$('.collapsed-text').slideDown(600);
					});

					// Perform close when EITHER button is clicked/touched
					$(".close-article").click(function(){
						if($(window).width() < 500)
						{
							$('.open-menu').css('display', 'block');
						}
						visualisator.css("opacity", "0");
						setTimeout(function()
						{
							visualisator.html(' ');
							reader.removeClass('is-visible');
							setTimeout(function()
							{
								reader.css('display', 'none');
								$('.content, aside').fadeIn(function(){
									$('.content').isotope({ filter: $filterValue });
								});
							}, 300);
						}, 300);

					});

					// Prev / next buttons
					$('.nextCard').click(function(){
						// TODO next card...
						$('.visualisator').animate({
							opacity: 0
						}, 200, function(){
							var i;
							for (i = 0; i<100; i++){
								currentCard += 1;
								if (currentCard > MAX_CARD_ID){
									currentCard = MIN_CARD_ID;
								}
								if( $("div.card[data-cardid='" + currentCard +"']").css('display') == 'block'){
									// Le resultat est bien dans les filtres => on s'arrete et on ouvre la fiche
									break;
								}
							}
							setTimeout(function(){
								getCardById(currentCard);
								var html = template(cardObject);
								$( ".visualisator" ).html(html);
								//getCardData( currentCard.toString(), null );
								$("html, body").animate({ scrollTop: 0 }, "fast");
							}, 200);
						});
					});
				}, 300);
			});

			$(window).load(function(){
				$('.content').isotope({
				  // options
				  itemSelector: '.card'
				});
			}, function(){
				content.hide();
			});

		} // end displayCards()
	}); // end getJSON


	/*
		6 - FILTERS
	*/

	var filters = {};

	// flatten object by concatting values
	function concatValues( obj ) {
	  var value = '';
	  for ( var prop in obj ) {
	  	if (obj[ prop ]) {
	    	value += obj[ prop ];
	    }
	  }
	  return value;
	}

	var $filterValue;
	// $(".filter1-btn-grp .btn").on('click', function() {
	// 	$(".filter1-btn-grp .btn").removeClass('is-active');
	// 	$(this).addClass('is-active');
	// 	$(this).parent().parent().find('span').show();
	// 	var filter = $(this).attr('data-filter');
	// 	filters['filter1-btn-grp'] = filter;
	// 	$filterValue = concatValues( filters );
	// 	$('.content').isotope({ filter: $filterValue });
	// });

	// $(".filter1 h4 span").on('click', function() {
	// 	$(this).parent().parent().find('.btn').removeClass('is-active');
	// 	$(this).hide();
	// 	filters['filter1-btn-grp'] = undefined;
	// 	$filterValue = concatValues( filters );
	// 	$('.content').isotope({ filter: $filterValue });
	// });

	$(".filter2-btn-grp .btn").on('click', function() {
		$(".filter2-btn-grp .btn").removeClass('is-active');
		$(this).addClass('is-active');
		$(this).parent().parent().find('span').show();
		var filter = $(this).attr('data-filter');
		filters['filter2-btn-grp'] = filter;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter2 h4 span").on('click', function() {
		$(this).parent().parent().find('.btn').removeClass('is-active');
		$(this).hide();
		filters['filter2-btn-grp'] = undefined;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter3-btn-grp .btn").on('click', function() {
		$(".filter3-btn-grp .btn").removeClass('is-active');
		$(this).addClass('is-active');
		$(this).parent().parent().find('span').show();
		var filter = $(this).attr('data-filter');
		filters['filter3-btn-grp'] = filter;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter3 h4 span").on('click', function() {
		$(this).parent().parent().find('.btn').removeClass('is-active');
		$(this).hide();
		filters['filter3-btn-grp'] = undefined;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter4-btn-grp .btn").on('click', function() {
		$(".filter4-btn-grp .btn").removeClass('is-active');
		$(this).addClass('is-active');
		$(this).parent().parent().find('span').show();
		var filter = $(this).attr('data-filter');
		filters['filter4-btn-grp'] = filter;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter4 h4 span").on('click', function() {
		$(this).parent().parent().find('.btn').removeClass('is-active');
		$(this).hide();
		filters['filter4-btn-grp'] = undefined;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter5-btn-grp .btn").on('click', function() {
		$(".filter5-btn-grp .btn").removeClass('is-active');
		$(this).addClass('is-active');
		$(this).parent().parent().find('span').show();
		var filter = $(this).attr('data-filter');
		filters['filter5-btn-grp'] = filter;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter5 h4 span").on('click', function() {
		$(this).parent().parent().find('.btn').removeClass('is-active');
		$(this).hide();
		filters['filter5-btn-grp'] = undefined;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter6-btn-grp .btn").on('click', function() {
		$(".filter6-btn-grp .btn").removeClass('is-active');
		$(this).addClass('is-active');
		$(this).parent().parent().find('span').show();
		var filter = $(this).attr('data-filter');
		filters['filter6-btn-grp'] = filter;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter6 h4 span").on('click', function() {
		$(this).parent().parent().find('.btn').removeClass('is-active');
		$(this).hide();
		filters['filter6-btn-grp'] = undefined;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

});
