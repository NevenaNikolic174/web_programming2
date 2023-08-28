const BASEURL = 'assets/data/';
const data = {};
var url = window.location.pathname;

function ajaxFetch(filePath, result) {
  $.ajax({ 
    url: BASEURL + filePath,
    method: "get",
    dataType: "json",
    success: result,
    error: function(xhr, ex){
      // console.log(xhr);
      var msg = '';
      if (xhr.status === 0) {
      msg = 'Not connect.\n Verify Network.';
      } else if (xhr.status == 404) {
      msg = 'Requested page not found. [404]';
      } else if (xhr.status == 500) {
      msg = 'Internal Server Error [500].';
      } else if (ex === 'parsererror') {
      msg = 'Requested JSON parse failed.';
      } else if (ex === 'timeout') {
      msg = 'Time out error.';
      } else if (ex === 'abort') {
      msg = 'Ajax request aborted.';
      } else {
      msg = 'Uncaught Error.\n' + xhr.responseText;
      }
      console.error(msg);
    }
  });
}
window.onload = function() {

  $(document).ready(function() {
    $('#loading').show();
    setTimeout(function() {
      $('#loading').fadeOut();
    }, 3000);
  });

  ajaxFetch('nav-meni.json', createNav);
  ajaxFetch('footer.json', createFooter);

  $('.navbar-toggler').click(function(){
    if ($('.navbar-collapse').hasClass('show')) {
      $('.navbar-collapse').removeClass('show').toggle(500);
    } else {
      $('.navbar-collapse').addClass('show').toggle(500);
    }
  });

  $(document).ready(() => {
    const topArrow = $("#top-arrow");

    topArrow.hide();
    $(window).on("scroll", () => topArrow.toggle($(window).scrollTop() > 100));
    topArrow.on("click", () => $("html,body").animate({ scrollTop: 0 }, 600));
  });

  const url = window.location.pathname;
  
  if (url === '/' || url === '/index.html') {
    ajaxFetch("slajder.json", createSlider);
    animacijaServices();
      document.querySelector('.main__btn').addEventListener("click", function() {
      document.getElementById("h1").scrollIntoView();
    });
  }
  if(url==='/register.html'){
   ajaxFetch("inputs.json", checkValidation);
   numberOfCharacters();
  }
  if (url === '/author.html') {
 
  }
  if(url == "/cart.html"){
    showData();
    applyOrder();
}
  if (url === '/shop.html') {

    ajaxFetch('brands.json', result => 
    createDropdownList(result, 'ddlBrend', 'Select brand:', 'listaBrendova', 'brend'));
    ajaxFetch('categories.json', result => 
    createDropdownList(result, 'ddlKat', 'Select product:', 'ListaKategorije', 'kat'));
    ajaxFetch("discounts.json", function(rezultat){
      displaysDiscounts(rezultat);
      saveToLocalStorage("popusti", rezultat);
      const products = retrieveFromLocalStorage("allProducts");
    const selectedFilter = null; // nema odabranog filtera
    displaysDiscounts(products, selectedFilter);
  });

    ajaxFetch('system.json', result => 
    createDropdownList(result, 'ddlSistem', 'Operative system:','operativniSistem', 'system'));
    ajaxFetch('sortiranje.json', result => 
    createDropdownList(result, 'ddlSort', 'Sort product by:', 'Sortiranje', 'sort'));
    ajaxFetch('products.json', result => {
      displayProducts(result);
      saveToLocalStorage("allProducts", result);
      printNumberOfProducts();
    });
    
    $("#search").on("input", changeFilter);
    $(document).on("change", 'input[name="popusti"]', changeFilter);
    $(document).on("change", "#ddlKat", changeFilter);
    $(document).on("change", "#ddlBrend", changeFilter);
    $(document).on("change", "#ddlSistem", changeFilter);
    $(document).on("change", "#ddlSort", changeFilter);
  }

function changeFilter() {
  let products = retrieveFromLocalStorage("allProducts");
  let filters = ["kat", "brend", "sistem"];
      
  filters.forEach(filter => {
    products = filterBy(products, filter);
  });
     
  products = sortBy(products); 
    
  const selectedFilter = $('input[name="popusti"]:checked').val() || null;
  products = filterByEnteredCharacters(products);
  products = filterBySelectedDiscount(products, selectedFilter);
  displayProducts(products);
}


function filterByEnteredCharacters(arr){
 let words = $("#search").val();
 var newArr = arr.filter((x) => (x.naziv.toLowerCase().includes(words.toLowerCase())));
 if(newArr.length === 0){
     displayNoProducts();
 }
 return newArr;
}
function filterBySelectedDiscount(arr, hasDiscount) {
 return hasDiscount === "1" ? arr.filter(x => x.popustID !== null) : hasDiscount === "2" ? 
                              arr.filter(x => x.popustID === null) : arr;
} 
function filterBy(nizProizvoda, tip){
  //console.log(nizProizvoda);
    let filteredArray = [];
    let id = null;
    let property = null;
    
    if(tip === "kat"){
      id = $("#ddlKat").val();
      property = "kategorijaID";
    }
    if(tip === "brend"){
      id = $("#ddlBrend").val();
      property = "brendID";
    }
   
    if(tip === "sistem"){
      id = $("#ddlSistem").val();
      property = "operativniSistem"; 
    }
    if(id === "0"){
      filteredArray = nizProizvoda;
    }
    else{
      filteredArray = nizProizvoda.filter(proizvod => proizvod[property] == id);
  
      if(property === "operativniSistem") {
        filteredArray = nizProizvoda.filter(product => 
          Array.isArray(product[property]) && product[property].includes(parseInt(id)));
      }
    }
    return filteredArray;
};
function sortBy(arr){
  let izbor = $("#ddlSort").val();
  //console.log(izbor);
  let sortedProducts = arr.sort((a, b) => 
  izbor === "1" ? b.cena.trenutnaCena - a.cena.trenutnaCena :
  izbor === "2" ? a.cena.trenutnaCena - b.cena.trenutnaCena :
  izbor === "3" ? a.naziv < b.naziv ? -1 : a.naziv > b.naziv ? 1 : 0 :
  izbor === "4" ? a.naziv > b.naziv ? -1 : a.naziv < b.naziv ? 1 : 0 :
  izbor === "5" ? a.godinaObjave - b.godinaObjave :
  izbor === "6" ? b.godinaObjave - a.godinaObjave : 0
);
  return sortedProducts;
};
function createDropdownList(data, listId, label, blockId, type) {
  let html = `<div class="mb-3">
               <label class="form-label">${label}</label>
                <select class="form-select" id="${listId}">
                    <option value="0">Choose</option>`;

      for(let item of data) {
          if(type === "pop") {
              html += `
                  <option value="1">With discount</option>
                  <option value="null">Without discount</option>`;
              break;
          } 
          else {
              html += `<option value="${item.id}">${item.naziv}</option>`;
          }
      }
    html += `</select></div>`;
  
  document.querySelector(`#${blockId}`).innerHTML = html;
}
const displaysDiscounts = (arr, selectedFilter) => {
  html= ` <li class="radioButtonIzgled">
     <input type="radio" class="popusti" name="popusti" value="1" />With Discounts
     <input type="radio" class="popusti" name="popusti" value="2" />Without Discounts
   </li>`
 $("#ListaPopusta").html(html);
}
function saveToLocalStorage(key, value){
  localStorage.setItem(key, JSON.stringify(value));
};
function retrieveFromLocalStorage(key){
  return JSON.parse(localStorage.getItem(key));
};
function displayProducts(arrProducts) {
  if(arrProducts.length == 0){
    displayNoProducts();
  }
  else {
    let ispisivanje = arrProducts.map(blok => {

return `
      <div class="col-md-4 mt-2">
           <div class="card blabla">
              <div class="card-body">
                  <div class="card-img-actions">
                  ${layoutDiscounts(blok.popustID, "popusti")}
                  <div class="single-product text-center">
                    <img src="${blok.slika}" alt="${blok.naziv}" class="img-fluid" width="200px" height="auto"/>
                  </div>      
                 </div>
                  </div>
                <div class="card-body bg-light text-center">
                  <div class="mb-2 izgled">
                    <h6 class="font-weight-semibold mb-2">
                      ${blok.naziv}
                    </h6>
                     
                     ${displayPrice(blok)}
                      <div class="text-muted mb-3"> <button type="button" class="btn btn-primary modalTaster" 
                                          id="tasterSpec-${blok.id}" data-toggle="modal" 
                                         data-target="#exampleModalLong-${blok.id}">
                                             View specifications
                                         </button> ${displaySpecifications(blok, blok.id)}
                                         </div>
                                         <div class="snipcart-details top_brand_home_details item_add single-item hvr-outline-out">
                                         <input type="button" data-id=${blok.id} value="Add to cart" class="button btn add-to-cart" />
                                     </div>
                                  </div>
                              </div>
                        </div> `
              });

              $("#proizvodi").html(ispisivanje);
              $(".add-to-cart").click(addToCart);
        }
};
function layoutDiscounts(id, key){
  if (!id) {return "";}

  let arrDiscounts = retrieveFromLocalStorage(key);
  let obj = arrDiscounts.find(obj => obj.id === id);
  
  return obj ? `<p class="discount">${obj.procenat}% OFF</p>` : "";
};
function displayPrice(blok) {
  let html = "";
  let price = blok.cena;
    if (price.staraCena != null) {
      html += `<h6 class="product-old-price"><del>$${price.staraCena}</del></h6>`
    }
      html += `<h4 class="product-price"><strong>$${price.trenutnaCena}</strong></h4>`;
      return html;
};
function displaySpecifications(data, id) {
  $('#tasterSpec-' + id).on('click', function() {
    $('#exampleModalLong-' + id).modal('show');
  });
  let html = "";
  for (let spec of data.specifikacije) {
    if(spec.naziv && spec.vrednost) {
        html += `<div class="specifikacija">
                  <p style="color: black;"><strong>${spec.naziv}:</strong> ${spec.vrednost}</p>
              </div>`;
        }
  }
  return `<div class="modal fade" id="exampleModalLong-${id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLongTitle" aria-hidden="true">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLongTitle" style="color:black;">${data.naziv}</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <div class="part-1">
                    <div class="card-body">
                    <div class="card-img-actions">
                    ${layoutDiscounts(data.popustID, "popusti")}
                    <div class="single-product text-center">
                    <img src="${data.slika}" alt="${data.naziv}" class="img-fluid" width="200px" height="auto"/>
                  </div>  
                  </div>
                </div>
                    <div class="part-2">
                      ${displayPrice(data)}
                    </div>
                  </div>
                  ${html}
                </div>
                <div class="snipcart-details top_brand_home_details item_add single-item hvr-outline-out">
                        <input type="button" data-id=${data.id} value="Add to cart" class="button btn add-to-cart" />
                    </div>
                </div>
            </div>
          </div>`;
};

function displayNoProducts() {
  document.getElementById("proizvodi").innerHTML = 
  '<p class="alert alert-danger">No products available.</p>';
}
/*KORPA*/
function showData() {
  retrieveFromLocalStorage("cart") == null ? showEmptyCart() : printCart();
}
function showEmptyCart(){
  $("#content").html(`<p>Empty cart.</p>`);
  $("#cart-sum").html("");
  $("#apply").html("");
}
function printCart(){
  let allProducts = retrieveFromLocalStorage("allProducts");
  let productsCart = retrieveFromLocalStorage("cart");

  let productsForDisplay = allProducts.filter(el => {
      for(let pCart of productsCart){
          if(el.id == pCart.id){
              el.qty = pCart.qty;
              return true;
          }
      }
      return false;
  })
  printTable(productsForDisplay);
}
function printTable(products){

  let tableRows = products.map(p => table(p)).join('');

  let sum = products.reduce((acc, p) => acc + (p.cena.trenutnaCena * p.qty), 0);
  const roundTwoDecimal = `$${Math.round(sum * 100) / 100}`;

  const html = `
    <table class="timetable_sub">
      <thead>
        <tr>
          <th>Product</th>
          <th>Product Name</th>
          <th>Base Price</th>
          <th>Quantity</th>
          <th>Price</th>
          <th><a href="#" id="removeAll">Remove</a></th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;
  $('#content').html(html);
  $('.btn-remove').click(removeFromCart);
  $('#cart-sum').html(`<strong class="d-block text-center">Total price: ${roundTwoDecimal}</strong>`);
  $('#apply').html(`<button type="button" class="btn btn-primary d-block mx-auto">Apply</button>`);

  $("#removeAll").click(function(){
    $('.timetable_sub tbody tr').remove();
    localStorage.removeItem("cart");
    showEmptyCart();
  });
  
  function table(p){
    return  `<tr class="rem1">
    <td class="invert-image">
        <a href="#">
            <img src="${p.slika}" style='height:100px' alt="${p.slika}" class="img-responsive">
        </a>
    </td>
    <td class="invert-name">${p.naziv}</td>
    <td class="invert-price">$${p.cena.trenutnaCena}</td>
    <td class="invert">
    <a href="#" class="decreaseQty ${p.qty === 1 ? 'disabled' : ''}" data-id="${p.id}">-</a>
    ${p.qty}
    <a href="#" class="increaseQty" data-id="${p.id}">+</a>
    </td>
    <td class="invert">$${p.cena.trenutnaCena * p.qty}</td>
    <td class="invert">
        <div class="rem">
            <div class=""><button class='btn-remove' data-id='${p.id}'><i class="fa fa-trash"></i></button> </div>
        </div>
    </td>
  </tr>`
  
  }
  $(".decreaseQty").click(decreaseQty);
  $(".increaseQty").click(increaseQty);
}
function removeFromCart() {
  const idP = $(this).data("id");
  let productsCart = retrieveFromLocalStorage("cart");

  const filtered = [];
  for (let i = 0; i < productsCart.length; i++) {
    if (productsCart[i].id !== idP) {
      filtered.push(productsCart[i]);
    }
  }

  if (filtered.length === 0) {
    localStorage.removeItem("cart");
  } else {
    saveToLocalStorage("cart", filtered);
  }

  showData();
}
function addToCart(){
  
  let idP = $(this).data("id");
  // console.log(idP)
  let productsCart = retrieveFromLocalStorage("cart");
  $("#message").html("<span>You have successfully added to the cart!</span>").fadeIn();
  setTimeout(function() {
      $("#message").fadeOut();
  }, 3000);

  if(productsCart == null){
      addFirstItemToCart();
      printNumberOfProducts();
  }
  else{
      if(productIsAlreadyInCart()){
          updateQty();
      }
      else{
          addItemToCart();
          printNumberOfProducts();
      }
  }
  function addFirstItemToCart(){

      let products = [
          {
              id: idP,
              qty: 1
          }
      ];
      saveToLocalStorage("cart", products);
  }

  function productIsAlreadyInCart(){
      return productsCart.filter(el => el.id == idP).length;
  }

  function updateQty(){

      let productsLS = retrieveFromLocalStorage("cart");
      for(let p of productsLS){
          if(p.id == idP){
              p.qty++;
              break;
          }
      }
      saveToLocalStorage("cart", productsLS);
  }
  function addItemToCart(){

      let productLS = retrieveFromLocalStorage("cart");
      productLS.push({
          id: idP,
          qty: 1
      });
      saveToLocalStorage("cart", productLS);
  }
}
function printNumberOfProducts(){

    let productsCart = retrieveFromLocalStorage("cart");
    if(productsCart == null){
        $("#broj-proizvoda").html(`(0)`);
    }
    else{
        let numberOfProducts = productsCart.length;
        $("#broj-proizvoda").html(`(${numberOfProducts})`)
    }
}
function increaseQty(e){
      e.preventDefault();
      let id = $(this).data("id");
      let products = retrieveFromLocalStorage("cart");
      let index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index].qty += 1;
        saveToLocalStorage("cart", products);
        printCart();
    }
}
function decreaseQty(e){
      e.preventDefault();
      
      let id = $(this).data("id");
      let products = retrieveFromLocalStorage("cart");
      let index = products.findIndex(p => p.id === id);
      if (index !== -1 && products[index].qty > 1) {
        products[index].qty -= 1;
        saveToLocalStorage("cart", products);
        printCart();
      }
}
}
/*OBRADA FORME*/ 
function checkValidation(inputs){

    var regexes = {
      fullName: /^[A-Za-zčćžđšČĆŽĐŠ\s]+$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      password: /.{8,}/
    };

    inputs.forEach(function(input) {
      var $input = $('#' + input.name);
      var $error = $('#' + input.name + '-error');
      var regex = regexes[input.type];

      $error.text('');

      $input.blur(function() {
        var value = $(this).val();
        if (value === '') {
          $error.text(input.errorMessages.empty);
        } else if (regex && !regex.test(value)) {
          $error.text(input.errorMessages.invalid);
        } else {
          $error.text('');
        }
      });
    });
  function checkIfTownIsSelected(){

    $("#grad").blur(function() {
        var grad = $(this).val();
        var errorText = (grad == "" || ( $(this).is('select') && (grad == null || grad == ""))) ? "Select a city" : "";
        $("#grad-error").text(errorText);
    });
}
  function isButtonClicked(){

    $("#submit-btn").click(function(e) {
      e.preventDefault();
      var hasError = false;
      $("input, select").each(function() {
        var value = $(this).val();
        if (value == "") {
          var errorText = "This field is required.";
          $(this).next(".text-danger").text(errorText);
          hasError = true;
        }
      });

        var age = $("input[name='user_age']:checked").val();
        if (!age) {
          $("#age-error").text("Select your age.");
          hasError = true;
        } else {
          $("#age-error").text("");
        }

        var interests = $("input[name='user_interest']:checked");
        if (interests.length === 0) {
          $("#interests-error").text("Choose at least one answer.");
          hasError = true;
        } else {
          $("#interests-error").text("");
        }

        if (hasError) {
          $("#success-message").hide();
          $("#error-message").show();
        } else {
          $("#error-message").hide();
          $("#success-message").show();
        }
    });
  }
  checkIfTownIsSelected();
  isButtonClicked();
}
function applyOrder() {
  $('#apply').click(function(e) {
    e.preventDefault();
    if ($('.alert-success').length) return;
  
    $(this).after(`
      <div id="loading">
        <ul class="loading">
          <li class="blue"></li>
          <li class="green"></li>
          <li class="yellow"></li>
          <li class="pink"></li>
        </ul>
        <div id="progress-message" style="font-weight: bolder;">Please wait</div>
      </div>
    `);
    $('.backToShop, .timetable_sub tbody tr').remove();
    setTimeout(function() {
      $('#loading').fadeOut(500, function() {
        $('#apply').after(`<div class="d-flex flex-column align-items-center my-5">
        <p class="text-left mb-0 backToShop">
          <a href="shop.html"><i class="fa fa-arrow-left mr-2"></i>Return to the <span class="font-weight-bold">shop</span> page.</a>
        </p>
        <p class="alert alert-success text-center my-5">
          You have applied successfully!
        </p>
      </div>`
                          );
        localStorage.removeItem("cart");
        $("#content, #cart-sum, #apply").empty();
      });
    }, 2000);
  });
}
/*Header,footer,slider*/
function createNav(arr) {
  let html = arr.map(link => {
      if (link.opcije) {
          return `<div class="dropdown">
                  <button class="dropdown-toggle nav-link" id="lista" type="button" data-toggle="dropdown">
                    ${link.name}
                  </button>
                  <div class="dropdown-menu links" id="ddlLista" aria-labelledby="dropdownMenuButton">
                    ${link.opcije.map(el => `<a class="dropdown-item" href="${el.href}">${el.name}</a>`).join('')}
                  </div>
              </div>`
      } else {
          return `<li class="nav-item">
                  <a class="nav-link" href="${link.href}">${link.name}</a>
              </li>`
      }
  }).join('');
  $('#meniLista').html(html);
}
function createFooter(links) {
  const footerLinks1 = document.getElementById('footerLinks1');
  const footerLinks2 = document.getElementById('footerLinks2');

  let footer1 = "";
  let footer2 = "";

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    let html = `<h5>${link.naslov}</h5><ul class='list-unstyled mb-0'>`;
    for (let j = 0; j < link.linkovi.length; j++) {
      const elem = link.linkovi[j];
      html += `<li><a href="${elem.href}" class="text-white">${elem.ime}</a></li>`;
    }
    html += `</ul>`;
    if (i === 0) {
      footer1 += html;
    } else {
      footer2 += html;
    }
  }

  footerLinks1.innerHTML = footer1;
  footerLinks2.innerHTML = footer2;
};
function animacijaServices(){
    $('.services__card .dugme').click(() => window.location.href = "shop.html");
          document.querySelectorAll('.services__card').forEach(e => {
            e.addEventListener('mouseenter', () => {
                e.style.transform = "scale(1.075)";
                e.style.transition = "0.2s ease-in";
                e.style.cursor = "pointer";
            });
            e.addEventListener('mouseleave', () => {
                e.style.transform = "scale(1)";
                e.style.transition = "0.2s ease-out";
            });
          });
};
function createSlider(slajder) {
  var carouselInner = document.getElementById("carousel-inner");

  for (var i = 0; i < slajder.length; i++) {
    var carouselItem = document.createElement("div");
    carouselItem.classList.add("carousel-item");
    if (i === 0) {
      carouselItem.classList.add("active");
    }
    var img = document.createElement("img");
    img.classList.add("d-block", "w-100");
    img.setAttribute("src", slajder[i].src);
    img.setAttribute("alt", slajder[i].alt);
    carouselItem.appendChild(img);
    carouselInner.appendChild(carouselItem);
  }
}
function numberOfCharacters(){
  $(document).ready(function() {
    $('#poruka').keyup(function() {
      var charCount = $(this).val().length;
      $('#charCount').text(charCount + ' / 200');
      if (charCount > 200) {
        $(this).val($(this).val().substr(0, 200));
        $('#charCount').text('200 / 200');
        $(this).attr('disabled', 'disabled');
      } else {
        $(this).removeAttr('disabled');
      }
    });
  });
}


