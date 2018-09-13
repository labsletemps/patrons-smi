/*
	1 - INIT
	2 - OVERLAY
	3 - LOAD JSON
	4 - OPEN MODAL
	5 - DISPLAY CARDS
	6 - FILTERS
*/

jQuery(document).ready(function($)
{
	/*
	 1 - INIT
	*/

	var currentCard, targetCard;
	var MIN_CARD_ID = 1;
	var MAX_CARD_ID = 100;
	var BASE_URL = 'https://labs.letemps.ch/interactive/2018/_digital-shapers/';
	var URL_TRAIL = 'digital_shapers';

	setTimeout(function()
	{
		$('.overlay .logo-lt-blanc, .spinner').fadeOut();
		setTimeout(function()
		{
			$('.overlay').fadeOut();
		}, 500);
	}, 1000);

	// Menu «filtres» (mobile uniquement)
	$(".open-menu").on('click', function(e) {
		$('aside').addClass('is-open');
		$(this).addClass('is-white');
	});

	$(".close-menu").on('click', function(e) {
		$('aside').removeClass('is-open');
		$('.open-menu').removeClass('is-white');
	});

	// Share buttons individuels
	function updateShareButtons(parameter){
		console.log('Updating share buttons for ' + parameter)
		$('.brand-social-wrapper a').each(function(i){
			var link = $(this).attr('href');
			// add card id

			if(targetCard){
				// replace page id parameter
				//link = link.replace('portrait='+parameter, 'portrait='+parameter)
				link = link.replace('portrait/'+parameter, 'portrait/'+parameter)
			}else{
				// add page id parameter
				link = link.replace(URL_TRAIL, URL_TRAIL + '/portrait/'+parameter)
			}
			// update nth link
			// $('.social-wrapper-individual a').eq(i).attr('href', link);
			$(this).attr('href', link);
		});
	}

	/*
	 2 - OVERLAY
 	*/

	var $overlayContent = $('.overlay-content'),
	$aside = $('aside');

	// Masquer l’overlay si clic sur «Démarrer» ou partage d’une card spécifique
	function hideOverlay(){
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
	}

	// Clic sur «démarrer»
	$(".overlay-content .btn").on('click', function(e) {
		hideOverlay();
	});

	// Card spécifique en paramètre de l’URL?
	var targetCardMatch = $(location).attr('href').match(/.*portrait=([a-z-]*).*?/);
	if (targetCardMatch) {
		if (targetCardMatch.length > 0){
			targetCard = targetCardMatch[1];
		}
		console.log('Target card found: ' + targetCard);
		hideOverlay();
	}

	/*
		3 - LOAD JSON
	*/
	// Chargement du json + ouverture card spécifique si paramètre
	var data = $.getJSON( "json/data.json", function(response) {
		// on affiche les cards
		displayCards(response);

		var source   = $("#detail-template").html();
		var template = Handlebars.compile(source);
		var cardObject;

		function getCardData(cardId, cardName = null){
			console.log('getCardData()');
			if(cardName){
				for(var item of response.cards){
					if( item['parameter'] == cardName ){ 
						cardObject = item;
						break;
					}
				}
			}else{
				for(var item of response.cards){
					if(item.cardId == cardId) {
						cardObject = item;
						break;
					}
				}
				//history.pushState({urlPath:'?portrait=' + cardObject.parameter},"Test",'?portrait=' + item.parameter)
				// history.pushState({urlPath:'/portrait=' + cardObject.parameter + '.html'},cardObject.cardTitre,BASE_URL+'/portrait/' + item.parameter + '.html')
				updateShareButtons(cardObject.parameter);
				currentCard = item.cardId;
				console.log(currentCard);

				var html = template(cardObject);
				$( ".visualisator" ).html(html);
				$('#debug').text('Card ID ' + currentCard);
				openModal();
				currentCard = parseInt(cardId);
				return;
			}

			// Test avec changement de bg selon categories
			/*if(cardObject['cardFilter1Tri'] == 'f-precurseurs'){
				if($('.bg').css('background-image').indexOf('Investors_400') < 0){
					$('.bg')
					.animate({opacity: 0}, 'fast', function() {
						$(this)
						.css({'background-image': 'url(img/2018/Investors_400.jpg)'})
						.animate({opacity: 1});
					});
				}
			}*/

			var html = template(cardObject);
			$( ".visualisator" ).html(html);
			$('#debug').text('Card ID ' + cardId + ' – updating share buttons');
			openModal();
			currentCard = parseInt(cardId); // cf $(".card").on()
			// updateShareButtons();
		}

		if (targetCard){
			getCardData(1, targetCard);
		}

		$(".card").on('click', function(e) {
			var cardId = $(this).data('cardid');

			getCardData(cardId);
			var html = template(cardObject);
			$( ".visualisator" ).html(html);
			$('#debug').text('Card ID ' + cardId + ' – updating share buttons [after click on card]');
			currentCard = parseInt(cardId); // cf getCardData
			// updateShareButtons();
		});

		$("body").on('click', ".previousCard", function(e) {
			$('.visualisator').animate({
				opacity: 0
			}, 200, function(){
				for (i = 0; i<100; i++){
					currentCard -= 1;
					if (currentCard < MIN_CARD_ID){
						currentCard = MAX_CARD_ID;
					}
					if( $("div.card[data-cardid='" + currentCard +"']").css('display') == 'block'){
						// Le resultat est bien dans les filtres => on s'arrete et on ouvre la fiche
						break;
					}
				}
				setTimeout(function(){
					getCardData( currentCard.toString() );
					$("html, body").animate({ scrollTop: 0 }, "fast");
				}, 200);
			});
		})

		$("body").on('click', ".nextCard", function(e) {
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
					getCardData( currentCard.toString() );
					$("html, body").animate({ scrollTop: 0 }, "fast");
				}, 200);
			});
		});
	}).fail(function() {
    // TODO add error handling
  });
	/* end load json */

	/*
		4 - OPEN MODAL
	*/
	function openModal(){
		var reader = $('.reader');
		var content = $('.content');
		var visualisator = $('.visualisator');

		$('html, body').animate({
			scrollTop:$('.content').offset().top
		}, 300);

		$(this).show("slide", { direction: "left" }, 1000);

		$('.open-menu').css('display', 'none');

		$('.content, aside').fadeOut();
		reader.css('display', 'block');
		setTimeout(function()
		{
			reader.addClass('is-visible');
		}, 10);

		reader.prepend('<svg class="close-article" version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="81px" height="81px" viewBox="0 0 81 81" enable-background="new 0 0 81 81" xml:space="preserve"><rect class="bg" fill="#D4D926" width="81" height="81"/><rect class="cross" x="14.551" y="39.344" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -16.7757 40.5)" fill="#FFFFFF" width="51.898" height="2.312"/><rect class="cross" x="14.551" y="39.344" transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 40.5 97.7757)" fill="#FFFFFF" width="51.898" height="2.312"/></svg>');

		//$('.readMore').click(function(){
		$("body").on('click', ".readMore", function(e) {
			$('.readMore').hide();
			$('.collapsed-text').slideDown(600);
		});

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
					$('aside, .content').fadeIn(function(){
						$('.content').isotope({ filter: $filterValue });

					});
				}, 300);
			}, 300);
		});

		setTimeout( function() {
			visualisator.css("opacity", "1");
			$(".bg, .visualisator-body .btn").click(function(){
				$(".close-article").trigger("click");
			});
		}, 300);
	}

	/*
		5 - DISPLAY CARDS
	*/

	function displayCards(arr) {
		var source = $("#card-template").html();
		var template = Handlebars.compile(source);

		var html = template({cards:arr.cards});
		$( ".content" ).html(html);

		var reader = $('.reader'),
		content = $('.content');
		var visualisator = $('.visualisator');

		$(".card").not('.na').on('click', function(e) {
			openModal();
		});

		$(window).load( function() {
			$('.content').isotope({
				// options
				itemSelector: '.card'
			});
		}, function(){
			content.hide();
		});
	}

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

	// Supprimé: switch pour #amount

	$(".filter1 h4 span").on('click', function(e) {
		$(this).parent().parent().find('.btn').removeClass('is-active');
		$(this).hide();
		filters['filter1-btn-grp'] = undefined;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	// TODO à déplacer?
	var $filterValue;

	$(".filter2-btn-grp .btn").on('click', function(e) {
		$(".filter2-btn-grp .btn").removeClass('is-active');
		$(this).addClass('is-active');
		$(this).parent().parent().find('span').show();
		var filter = $(this).attr('data-filter');
		filters['filter2-btn-grp'] = filter;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter2 h4 span").on('click', function(e) {
		$(this).parent().parent().find('.btn').removeClass('is-active');
		$(this).hide();
		filters['filter2-btn-grp'] = undefined;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter3-btn-grp .btn").on('click', function(e) {
		$(".filter3-btn-grp .btn").removeClass('is-active');
		$(this).addClass('is-active');
		$(this).parent().parent().find('span').show();
		var filter = $(this).attr('data-filter');
		filters['filter3-btn-grp'] = filter;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter3 h4 span").on('click', function(e) {
		$(this).parent().parent().find('.btn').removeClass('is-active');
		$(this).hide();
		filters['filter3-btn-grp'] = undefined;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter4-btn-grp .btn").on('click', function(e) {
		$(".filter4-btn-grp .btn").removeClass('is-active');
		$(this).addClass('is-active');
		$(this).parent().parent().find('span').show();
		var filter = $(this).attr('data-filter');
		filters['filter4-btn-grp'] = filter;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter4 h4 span").on('click', function(e) {
		$(this).parent().parent().find('.btn').removeClass('is-active');
		$(this).hide();
		filters['filter4-btn-grp'] = undefined;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter5-btn-grp .btn").on('click', function(e) {
		$(".filter5-btn-grp .btn").removeClass('is-active');
		$(this).addClass('is-active');
		$(this).parent().parent().find('span').show();
		var filter = $(this).attr('data-filter');
		filters['filter5-btn-grp'] = filter;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter5 h4 span").on('click', function(e) {
		$(this).parent().parent().find('.btn').removeClass('is-active');
		$(this).hide();
		filters['filter5-btn-grp'] = undefined;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter6-btn-grp .btn").on('click', function(e) {
		$(".filter6-btn-grp .btn").removeClass('is-active');
		$(this).addClass('is-active');
		$(this).parent().parent().find('span').show();
		var filter = $(this).attr('data-filter');
		filters['filter6-btn-grp'] = filter;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

	$(".filter6 h4 span").on('click', function(e) {
		$(this).parent().parent().find('.btn').removeClass('is-active');
		$(this).hide();
		filters['filter6-btn-grp'] = undefined;
		$filterValue = concatValues( filters );
		$('.content').isotope({ filter: $filterValue });
	});

});
